import { auth } from "@/auth";
import { isValidSlug } from "@/lib/pipeline-utils";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

export const runtime = "nodejs";

async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ...(ref ? { ref } : {}) });
    if (Array.isArray(data) || data.type !== "file") return null;
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

function extractSection(outline: string, heading: string): string | null {
  const lines = outline.split("\n");
  const startIdx = lines.findIndex((l) => l.trimEnd() === `## ${heading}`);
  if (startIdx === -1) return null;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ") || lines[i].trimEnd() === "---") {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join("\n").trimEnd();
}

function extractEvidenceFiles(sectionContent: string): string[] {
  const match = sectionContent.match(/\*\*Evidence:\*\* (.+)/);
  if (!match) return [];
  return match[1]
    .split(",")
    .map((p) => p.trim().replace(/`/g, ""))
    .filter((p) => p.startsWith("knowledge-store/"));
}

function patchSection(outline: string, heading: string, newSection: string): string {
  const lines = outline.split("\n");
  const startIdx = lines.findIndex((l) => l.trimEnd() === `## ${heading}`);
  if (startIdx === -1) return outline;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ") || lines[i].trimEnd() === "---") {
      endIdx = i;
      break;
    }
  }
  return [
    ...lines.slice(0, startIdx),
    newSection.trimEnd(),
    "",
    ...lines.slice(endIdx),
  ].join("\n");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

  const body = await req.json();
  const { sectionHeading, feedback, prNumber } = body;

  if (!sectionHeading || typeof sectionHeading !== "string" || !feedback || typeof feedback !== "string") {
    return Response.json({ error: "sectionHeading and feedback required" }, { status: 400 });
  }
  if (typeof prNumber !== "number" || !Number.isInteger(prNumber) || prNumber <= 0) {
    return Response.json({ error: "prNumber required" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;

  // Get PR branch
  let branchRef: string;
  try {
    const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    branchRef = pr.head.ref;
  } catch {
    return Response.json({ error: "Could not find PR" }, { status: 404 });
  }

  // Read outline from branch
  const outline = await getFileContent(octokit, owner, repo, `outputs/${slug}/outline.md`, branchRef);
  if (!outline) {
    return Response.json({ error: "Outline not found" }, { status: 404 });
  }

  // Extract the target section
  const sectionContent = extractSection(outline, sectionHeading);
  if (!sectionContent) {
    return Response.json({ error: "Section not found in outline" }, { status: 404 });
  }

  // Fetch brief and evidence files in parallel
  const evidenceFiles = extractEvidenceFiles(sectionContent);
  const [brief, ...evidenceContents] = await Promise.all([
    getFileContent(octokit, owner, repo, `briefs/${slug}/brief.md`),
    ...evidenceFiles.map((f) => getFileContent(octokit, owner, repo, f)),
  ]);

  const evidenceContext = evidenceFiles
    .map((f, i) => (evidenceContents[i] ? `### ${f}\n\n${evidenceContents[i]}` : null))
    .filter(Boolean)
    .join("\n\n---\n\n");

  // LLM call
  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN,
  });

  const systemPrompt = `You are updating a single section of a content outline based on editorial feedback. Return only the updated section — the H2 heading and its content. No explanation, no surrounding text, no markdown code fences.

The outline uses this section format:

## {Section heading — states a claim}

**Evidence:** {comma-separated knowledge-store file paths}

\`[NEEDS SOURCE: {description}]\` — only if coverage is genuinely missing
\`[FETCH: {url} — needed for {section}]\` — only if a live URL fetch is needed

Rules:
- The heading must state a claim (what is true, what the reader should believe after this section)
- Keep the same Evidence file paths unless the feedback explicitly changes scope
- Only include NEEDS SOURCE or FETCH markers if genuinely needed
- No section descriptions, word counts, or quote assignments`;

  const userPrompt = [
    brief ? `## Brief\n\n${brief}` : "",
    `## Full outline (context — do not modify other sections)\n\n${outline}`,
    `## Section to update\n\n${sectionContent}`,
    evidenceContext ? `## Evidence available for this section\n\n${evidenceContext}` : "",
    `## Editor feedback\n\n${feedback}`,
    "Return only the updated section.",
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");

  let newSection: string;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    newSection = response.choices[0]?.message?.content?.trim() ?? "";
    if (!newSection) {
      return Response.json({ error: "LLM returned empty response" }, { status: 500 });
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "LLM call failed" },
      { status: 500 }
    );
  }

  // Patch the outline
  const updatedOutline = patchSection(outline, sectionHeading, newSection);

  // Write updated outline back to the PR branch
  try {
    let existingSha: string | undefined;
    try {
      const existing = await octokit.repos.getContent({
        owner,
        repo,
        path: `outputs/${slug}/outline.md`,
        ref: branchRef,
      });
      if (!Array.isArray(existing.data) && existing.data.sha) {
        existingSha = existing.data.sha;
      }
    } catch { /* file not found — proceed without SHA */ }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `outputs/${slug}/outline.md`,
      message: `fix: update "${sectionHeading}" section for ${slug}`,
      content: Buffer.from(updatedOutline).toString("base64"),
      branch: branchRef,
      ...(existingSha ? { sha: existingSha } : {}),
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to write outline" },
      { status: 500 }
    );
  }

  return Response.json({ outline: updatedOutline });
}
