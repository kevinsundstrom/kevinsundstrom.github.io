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

function extractHeadline(content: string): string | null {
  const line = content.split("\n").find((l) => l.startsWith("# "));
  return line ?? null;
}

function extractIntro(content: string): string | null {
  const lines = content.split("\n");
  const h1Idx = lines.findIndex((l) => l.startsWith("# "));
  if (h1Idx === -1) return null;
  const firstH2 = lines.findIndex((l, i) => i > h1Idx && l.startsWith("## "));
  const endIdx = firstH2 === -1 ? lines.length : firstH2;
  return lines.slice(h1Idx + 1, endIdx).join("\n").trim() || null;
}

function extractSection(content: string, heading: string): string | null {
  const lines = content.split("\n");
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

function extractAllEvidenceFiles(outline: string): string[] {
  const files = new Set<string>();
  for (const match of outline.matchAll(/\*\*Evidence:\*\* (.+)/g)) {
    match[1].split(",").forEach((p) => {
      const clean = p.trim().replace(/`/g, "");
      if (clean.startsWith("knowledge-store/")) files.add(clean);
    });
  }
  return [...files];
}

function patchHeadline(content: string, newHeadline: string): string {
  const lines = content.split("\n");
  const h1Idx = lines.findIndex((l) => l.startsWith("# "));
  if (h1Idx === -1) return content;
  const normalized = newHeadline.startsWith("# ") ? newHeadline.trimEnd() : `# ${newHeadline.trimEnd()}`;
  return [...lines.slice(0, h1Idx), normalized, ...lines.slice(h1Idx + 1)].join("\n");
}

function patchIntro(content: string, newIntro: string): string {
  const lines = content.split("\n");
  const h1Idx = lines.findIndex((l) => l.startsWith("# "));
  if (h1Idx === -1) return content;
  const firstH2 = lines.findIndex((l, i) => i > h1Idx && l.startsWith("## "));
  const endIdx = firstH2 === -1 ? lines.length : firstH2;
  return [
    ...lines.slice(0, h1Idx + 1),
    "",
    newIntro.trim(),
    "",
    ...lines.slice(endIdx),
  ].join("\n");
}

function patchSection(content: string, heading: string, newSection: string): string {
  const lines = content.split("\n");
  const startIdx = lines.findIndex((l) => l.trimEnd() === `## ${heading}`);
  if (startIdx === -1) return content;
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

  // Read draft and outline in parallel
  const [draft, outline] = await Promise.all([
    getFileContent(octokit, owner, repo, `outputs/${slug}/draft.md`, branchRef),
    getFileContent(octokit, owner, repo, `outputs/${slug}/outline.md`),
  ]);

  if (!draft) return Response.json({ error: "Draft not found" }, { status: 404 });

  let sectionContent: string | null;
  if (sectionHeading === "Headline") {
    sectionContent = extractHeadline(draft);
  } else if (sectionHeading === "Introduction") {
    sectionContent = extractIntro(draft);
  } else {
    sectionContent = extractSection(draft, sectionHeading);
  }
  if (!sectionContent) return Response.json({ error: "Section not found in draft" }, { status: 404 });

  // Fetch brief and all evidence files referenced in the outline
  const evidenceFiles = outline ? extractAllEvidenceFiles(outline) : [];
  const [brief, ...evidenceContents] = await Promise.all([
    getFileContent(octokit, owner, repo, `briefs/${slug}/brief.md`),
    ...evidenceFiles.map((f) => getFileContent(octokit, owner, repo, f)),
  ]);

  const evidenceContext = evidenceFiles
    .map((f, i) => (evidenceContents[i] ? `### ${f}\n\n${evidenceContents[i]}` : null))
    .filter(Boolean)
    .join("\n\n---\n\n");

  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN,
  });

  let systemPrompt: string;
  let rewriteInstruction: string;

  if (sectionHeading === "Headline") {
    systemPrompt = `You are rewriting the headline of a content draft based on editorial feedback. Return only the updated headline as a single line of plain text — no # prefix, no explanation, no surrounding text, no markdown code fences.

Rules:
- Write for the reader's situation, not about the article's content
- No buzzwords or hyperbole
- Avoid punctuation that splices two separate ideas — if a colon or dash is load-bearing, rewrite as one clean thought
- Clear without additional context — if it only makes sense after reading the article, rewrite it
- As short as possible without saying nothing
- The test: does a senior engineer feel recognized, or informed? Aim for recognized`;
    rewriteInstruction = "Rewrite the headline based on the feedback. Return only the headline text — no # prefix, no explanation.";
  } else if (sectionHeading === "Introduction") {
    systemPrompt = `You are rewriting the introduction of a content draft based on editorial feedback. Return only the updated introduction prose — no heading, no explanation, no surrounding text, no markdown code fences.

Rules:
- State the problem and the article's argument immediately — no wind-up or throat-clearing
- The first sentence should make the target reader feel recognized, not just informed
- Length: 2–3 sentences, one short paragraph maximum
- Write in active, clear editorial voice — the same tone as the rest of the draft
- Do not repeat any quote, analogy, or vivid phrasing that appears elsewhere in the draft`;
    rewriteInstruction = "Rewrite the introduction based on the feedback. Return only the introduction prose — no heading, no explanation.";
  } else {
    systemPrompt = `You are rewriting a single section of a content draft based on editorial feedback. Return only the updated section — the H2 heading and its body content. No explanation, no surrounding text, no markdown code fences.

Rules:
- Start with the H2 heading: ## ${sectionHeading}
- Write in active, clear editorial voice — the same tone as the rest of the draft
- State ideas as declarative prose. Do not open a paragraph with a named source as the subject
- A quote earns its place when the phrasing itself is the point. If a quote carries information prose could state more directly, paraphrase it
- Do not repeat any quote, analogy, or vivid phrasing that appears elsewhere in the draft
- Where coverage is thin and sources don't fill the gap, write [NEEDS SOURCE: {description}] inline
- Do not pad thin sections with generalities`;
    rewriteInstruction = "Rewrite this section based on the feedback. Return only the updated section.";
  }

  const userPrompt = [
    brief ? `## Brief\n\n${brief}` : "",
    outline ? `## Approved outline (section headings are the intended claims — use to stay aligned with the narrative)\n\n${outline}` : "",
    `## Full draft (for context and coherence — do not modify other sections)\n\n${draft}`,
    `## Content to rewrite\n\n${sectionContent}`,
    evidenceContext ? `## Source material\n\n${evidenceContext}` : "",
    `## Editorial feedback\n\n${feedback}`,
    rewriteInstruction,
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
    if (!newSection) return Response.json({ error: "LLM returned empty response" }, { status: 500 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "LLM call failed" }, { status: 500 });
  }

  let updatedDraft: string;
  if (sectionHeading === "Headline") {
    updatedDraft = patchHeadline(draft, newSection);
  } else if (sectionHeading === "Introduction") {
    updatedDraft = patchIntro(draft, newSection);
  } else {
    updatedDraft = patchSection(draft, sectionHeading, newSection);
  }

  try {
    let existingSha: string | undefined;
    try {
      const existing = await octokit.repos.getContent({
        owner, repo, path: `outputs/${slug}/draft.md`, ref: branchRef,
      });
      if (!Array.isArray(existing.data) && existing.data.sha) existingSha = existing.data.sha;
    } catch { /* file not found */ }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `outputs/${slug}/draft.md`,
      message: `fix: update "${sectionHeading}" section for ${slug}`,
      content: Buffer.from(updatedDraft).toString("base64"),
      branch: branchRef,
      ...(existingSha ? { sha: existingSha } : {}),
    });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Failed to write draft" }, { status: 500 });
  }

  return Response.json({ draft: updatedDraft });
}
