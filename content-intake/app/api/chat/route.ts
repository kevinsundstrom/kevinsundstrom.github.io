import OpenAI from "openai";
import { Octokit } from "@octokit/rest";
import { INTAKE_SYSTEM_PROMPT } from "@/lib/intake-system-prompt";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

async function readFile(
  path: string,
  githubToken: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  const octokit = new Octokit({ auth: githubToken });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;

  try {
    const result = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(result.data) || result.data.type !== "file") {
      return { success: false, error: "Path is a directory, not a file" };
    }
    const content = Buffer.from(result.data.content, "base64").toString("utf-8");
    return { success: true, content };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "File not found",
    };
  }
}

async function commitFile(
  path: string,
  content: string,
  message: string,
  githubToken: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const octokit = new Octokit({ auth: githubToken });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;

  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({ owner, repo, path });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch {
    // File doesn't exist yet — fine
  }

  try {
    const result = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString("base64"),
      sha,
    });
    return { success: true, url: result.data.content?.html_url };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown GitHub API error",
    };
  }
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Read a file from the pipeline GitHub repository. Use this to check knowledge store coverage before starting a brief. Start with knowledge-store/STATE.md to see what topics exist, then read specific living docs or summaries as needed.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "File path in the repo. E.g. knowledge-store/STATE.md, knowledge-store/living-docs/agent-orchestration.md, knowledge-store/summaries/2026-01-06-matt-nigh-agent-orchestration.md",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "commit_file",
      description:
        "Commit a file to the pipeline GitHub repository. Only call this after the user has explicitly confirmed they want to proceed.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "File path in the repo. E.g. briefs/my-slug/brief.md or knowledge-store/transcripts/2026-01-15-name-topic.md",
          },
          content: {
            type: "string",
            description: "Full file content as a string",
          },
          message: {
            type: "string",
            description: "Git commit message",
          },
        },
        required: ["path", "content", "message"],
      },
    },
  },
];

export async function POST(req: Request) {
  // Auth check
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { messages: clientMessages, conversationId } = await req.json();

  // Use service token for all GitHub operations
  const githubToken = process.env.GITHUB_TOKEN!;

  // GitHub Models inference still uses GITHUB_TOKEN (service token)
  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const allMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [{ role: "system", content: INTAKE_SYSTEM_PROMPT }, ...clientMessages];

      let finalAssistantText = "";
      let briefSlugCommitted: string | null = null;
      let anyCommitSucceeded = false;

      // Loop to handle tool calls — keeps going until no tool call is returned
      while (true) {
        const stream = await client.chat.completions.create({
          model: "gpt-4o",
          stream: true,
          tools,
          tool_choice: "auto",
          messages: allMessages,
        });

        let assistantText = "";
        const toolCallAccumulator: Record<
          number,
          { id: string; name: string; arguments: string }
        > = {};
        let finishReason: string | null = null;

        for await (const chunk of stream) {
          const choice = chunk.choices[0];
          if (!choice) continue;

          finishReason = choice.finish_reason ?? finishReason;

          const text = choice.delta?.content ?? "";
          if (text) {
            assistantText += text;
            finalAssistantText += text;
            controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
          }

          for (const toolCall of choice.delta?.tool_calls ?? []) {
            const idx = toolCall.index;
            if (!toolCallAccumulator[idx]) {
              toolCallAccumulator[idx] = {
                id: toolCall.id ?? "",
                name: toolCall.function?.name ?? "",
                arguments: "",
              };
            }
            if (toolCall.id) toolCallAccumulator[idx].id = toolCall.id;
            if (toolCall.function?.name)
              toolCallAccumulator[idx].name = toolCall.function.name;
            if (toolCall.function?.arguments)
              toolCallAccumulator[idx].arguments +=
                toolCall.function.arguments;
          }
        }

        const toolCalls = Object.values(toolCallAccumulator);

        if (finishReason === "tool_calls" && toolCalls.length > 0) {
          allMessages.push({
            role: "assistant",
            content: assistantText || null,
            tool_calls: toolCalls.map((tc) => ({
              id: tc.id,
              type: "function" as const,
              function: { name: tc.name, arguments: tc.arguments },
            })),
          });

          for (const tc of toolCalls) {
            if (tc.name === "read_file") {
              let result: { success: boolean; content?: string; error?: string };
              try {
                const args = JSON.parse(tc.arguments);
                result = await readFile(args.path, githubToken);
              } catch {
                result = { success: false, error: "Failed to parse tool arguments" };
              }

              allMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify(result),
              });
            } else if (tc.name === "commit_file") {
              let result: { success: boolean; url?: string; error?: string };
              try {
                const args = JSON.parse(tc.arguments);
                result = await commitFile(args.path, args.content, args.message, githubToken);

                if (result.success) {
                  anyCommitSucceeded = true;
                  const briefMatch = args.path.match(/^briefs\/([^/]+)\/brief\.md$/);
                  if (briefMatch) briefSlugCommitted = briefMatch[1];
                }
              } catch {
                result = {
                  success: false,
                  error: "Failed to parse tool arguments",
                };
              }

              allMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: JSON.stringify(result),
              });
            }
          }

          continue;
        }

        break;
      }

      // Signal session end to client before closing
      if (anyCommitSucceeded) {
        controller.enqueue(encoder.encode(`2:[{"sessionCommitted":true}]\n`));
      }

      controller.close();

      // Persist messages to DB after streaming ends
      if (conversationId) {
        try {
          // Persist the last user message
          const lastUserMsg = [...clientMessages].reverse().find(
            (m: { role: string; content: string }) => m.role === "user"
          );
          if (lastUserMsg) {
            await db.insert(messages).values({
              conversationId,
              role: "user",
              content: lastUserMsg.content,
            });
          }

          // Persist the assistant response
          if (finalAssistantText) {
            await db.insert(messages).values({
              conversationId,
              role: "assistant",
              content: finalAssistantText,
            });
          }

          // Mark session as committed after any successful commit
          if (anyCommitSucceeded) {
            await db
              .update(conversations)
              .set({
                status: "committed",
                ...(briefSlugCommitted ? { briefSlug: briefSlugCommitted } : {}),
              })
              .where(eq(conversations.id, conversationId));
          }
        } catch {
          // Persistence failure is non-fatal — streaming already succeeded
        }
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
