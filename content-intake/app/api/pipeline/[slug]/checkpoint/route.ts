import { auth } from "@/auth";
import { isValidSlug, isValidPrNumber } from "@/lib/pipeline-utils";
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
  if (!isValidSlug(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

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
    const slugSpaces = slug.replace(/-/g, " ");
    const pr = prs.find(
      (p) =>
        p.labels.some((l) => l.name === "checkpoint-1") &&
        (p.head.ref.includes(slug) ||
          p.title.toLowerCase().includes(slug) ||
          p.title.toLowerCase().includes(slugSpaces))
    );
    if (pr) ref = pr.head.ref;
  } catch {
    // fall through to main
  }

  const outline = await getFileContent(octokit, owner, repo, `outputs/${slug}/outline.md`, ref);

  return Response.json({ outline });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { prNumber, action, feedback, gaps } = body;

  if (!isValidPrNumber(prNumber)) {
    return Response.json({ error: "prNumber required" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return Response.json({ error: "Invalid slug" }, { status: 400 });
  }

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

    // Write gap resolutions FIRST — before updating the branch or merging.
    // This ensures the single mergeability poll at the end accounts for all branch changes.
    const resolvedGaps: Array<{ section: string; description: string; resolution: string }> = gaps ?? [];
    if (resolvedGaps.length > 0) {
      const resolutionContent = [
        "# Gap Resolutions",
        "",
        `**Slug:** ${slug}`,
        `**Resolved:** ${new Date().toISOString()}`,
        "",
        "---",
        "",
        ...resolvedGaps.map((gap) =>
          [
            `## ${gap.section}`,
            "",
            `**Gap:** ${gap.description}`,
            `**Resolution:** ${gap.resolution === "research" ? "Research from first-party sources" : "Approved thin — proceed without filling"}`,
            "",
          ].join("\n")
        ),
      ].join("\n");

      let existingSha: string | undefined;
      try {
        const existing = await octokit.repos.getContent({
          owner,
          repo,
          path: `outputs/${slug}/gap-resolutions.md`,
          ref: pr.head.ref,
        });
        if (!Array.isArray(existing.data) && existing.data.sha) {
          existingSha = existing.data.sha;
        }
      } catch {
        // File doesn't exist yet — proceed without SHA
      }

      try {
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: `outputs/${slug}/gap-resolutions.md`,
          message: `feat: gap resolutions for ${slug} [checkpoint-1]`,
          content: Buffer.from(resolutionContent).toString("base64"),
          branch: pr.head.ref,
          ...(existingSha ? { sha: existingSha } : {}),
        });
      } catch (err) {
        console.error("Failed to write gap resolutions:", err);
        return Response.json(
          { error: "Failed to write gap resolutions — approval not completed" },
          { status: 500 }
        );
      }
    }

    // Bring the branch current with main after all writes are done.
    try {
      await octokit.pulls.updateBranch({ owner, repo, pull_number: prNumber });
    } catch {
      // Non-fatal: throws 422 if already up to date — continue
    }

    // Poll until GitHub confirms the branch is current AND mergeable.
    // mergeable === true means no conflicts; mergeable_state === "clean" means up to date.
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const { data: updated } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
      if (updated.mergeable === false) {
        return Response.json({ error: "PR has merge conflicts — resolve them before approving." }, { status: 422 });
      }
      if (updated.mergeable === true && updated.mergeable_state === "clean") break;
      // null / "behind" / "unknown" — keep waiting
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
