import { auth } from "@/auth";
import { isValidSlug } from "@/lib/pipeline-utils";
import { Octokit } from "@octokit/rest";

export const runtime = "nodejs";

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

  // Close any open checkpoint-2 PRs for this slug
  try {
    const { data: prs } = await octokit.pulls.list({ owner, repo, state: "open", per_page: 100 });
    const draftPrs = prs.filter(
      (p) =>
        p.labels.some((l) => l.name === "checkpoint-2") &&
        (p.head.ref.includes(slug) || p.title.toLowerCase().includes(slug))
    );
    for (const pr of draftPrs) {
      await octokit.pulls.update({ owner, repo, pull_number: pr.number, state: "closed" });
      // Delete the head branch
      try {
        await octokit.git.deleteRef({ owner, repo, ref: `heads/${pr.head.ref}` });
      } catch {
        // Branch may already be gone
      }
    }
  } catch {
    // Non-fatal — proceed to dispatch anyway
  }

  // Dispatch the draft workflow
  try {
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: "draft.lock.yml",
      ref: "main",
      inputs: { slug },
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to dispatch workflow" },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
