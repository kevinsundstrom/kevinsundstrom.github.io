import { auth } from "@/auth";
import { Octokit } from "@octokit/rest";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Find the open checkpoint-1 PR for this slug to get its head branch.
  // The planning agent commits outputs to the PR branch, not main.
  let ref: string | undefined;
  try {
    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });
    const pr = prs.find(
      (p) =>
        p.labels.some((l) => l.name === "checkpoint-1") &&
        (p.head.ref.includes(slug) || p.title.toLowerCase().includes(slug))
    );
    if (pr) ref = pr.head.ref;
  } catch {
    // fall through to main
  }

  const [outline, coverageMap] = await Promise.all([
    getFileContent(octokit, owner, repo, `outputs/${slug}/outline.md`, ref),
    getFileContent(octokit, owner, repo, `outputs/${slug}/coverage-map.md`, ref),
  ]);

  return Response.json({ outline, coverageMap });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prNumber, action, feedback } = await req.json();
  if (!prNumber) {
    return Response.json({ error: "prNumber required" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;
  const { slug } = await params;

  if (action === "request-changes") {
    try {
      if (feedback?.trim()) {
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: `**Changes requested by ${session.user.name ?? session.user.email ?? "reviewer"}:**\n\n${feedback.trim()}\n\n*Closing this PR. Submit a revised brief to restart the pipeline.*`,
        });
      }
      await octokit.pulls.update({
        owner,
        repo,
        pull_number: prNumber,
        state: "closed",
      });
      return Response.json({ success: true });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Failed to close PR" },
        { status: 500 }
      );
    }
  }

  // Default: approve (merge)
  try {
    // Draft PRs can't be merged — use GraphQL to mark ready for review first
    const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
    if (pr.draft) {
      await octokit.graphql(
        `mutation($prId: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $prId }) { pullRequest { isDraft } } }`,
        { prId: pr.node_id }
      );
    }

    await octokit.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
      merge_method: "squash",
      commit_title: `approve checkpoint 1: ${slug}`,
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Merge failed" },
      { status: 500 }
    );
  }
}
