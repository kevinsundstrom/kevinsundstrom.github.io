import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isValidSlug } from "@/lib/pipeline-utils";
import { Octokit } from "@octokit/rest";

export const runtime = "nodejs";

async function collectPaths(
  octokit: Octokit,
  owner: string,
  repo: string,
  dirPath: string
): Promise<string[]> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: dirPath });
    if (!Array.isArray(data)) return [];
    return data.filter((e) => e.type === "file").map((e) => e.path);
  } catch {
    return [];
  }
}

async function batchDelete(
  octokit: Octokit,
  owner: string,
  repo: string,
  paths: string[],
  message: string
): Promise<void> {
  if (paths.length === 0) return;

  const { data: ref } = await octokit.git.getRef({ owner, repo, ref: "heads/main" });
  const commitSha = ref.object.sha;
  const { data: commit } = await octokit.git.getCommit({ owner, repo, commit_sha: commitSha });

  const { data: newTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: commit.tree.sha,
    tree: paths.map((path) => ({
      path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: null,
    })),
  });

  const { data: newCommit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [commitSha],
  });

  await octokit.git.updateRef({ owner, repo, ref: "heads/main", sha: newCommit.sha });
}

export async function POST(
  _req: Request,
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

  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // 1. Close any open PRs and delete their branches
  try {
    const { data: prs } = await octokit.pulls.list({ owner, repo, state: "open", per_page: 100 });
    const related = prs.filter(
      (p) =>
        (p.labels.some((l) => l.name === "checkpoint-1" || l.name === "checkpoint-2") ||
          p.head.ref.startsWith("intake/") ||
          p.head.ref.startsWith("planning/") ||
          p.head.ref.startsWith("draft/")) &&
        (p.head.ref.includes(slug) || p.title.toLowerCase().includes(slug))
    );
    for (const pr of related) {
      try { await octokit.pulls.update({ owner, repo, pull_number: pr.number, state: "closed" }); } catch { /* ignore */ }
      try { await octokit.git.deleteRef({ owner, repo, ref: `heads/${pr.head.ref}` }); } catch { /* ignore */ }
    }
  } catch { /* Non-fatal */ }

  // 2. Collect all paths to delete, then delete in one commit
  const outputFiles = await collectPaths(octokit, owner, repo, `outputs/${slug}`);
  const allPaths: string[] = [];
  // Check brief file
  try {
    await octokit.repos.getContent({ owner, repo, path: `briefs/${slug}/brief.md` });
    allPaths.push(`briefs/${slug}/brief.md`);
  } catch { /* doesn't exist */ }
  allPaths.push(...outputFiles);

  await batchDelete(octokit, owner, repo, allPaths, `chore: abandon brief ${slug}`);

  // 3. Reset conversation record
  await db
    .update(conversations)
    .set({ briefSlug: null, status: "committed" })
    .where(eq(conversations.briefSlug, slug));

  return Response.json({ success: true });
}
