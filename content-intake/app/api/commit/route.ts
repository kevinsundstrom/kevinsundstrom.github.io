import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.PIPELINE_REPO_OWNER!;
const repo = process.env.PIPELINE_REPO_NAME!;

export async function POST(req: Request) {
  const { path, content, message } = await req.json();

  if (!path || !content || !message) {
    return Response.json(
      { error: "path, content, and message are required" },
      { status: 400 }
    );
  }

  // Check if file already exists (needed to pass sha for updates)
  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({ owner, repo, path });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch {
    // File doesn't exist yet — that's fine, sha stays undefined
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

    return Response.json({
      success: true,
      url: result.data.content?.html_url,
      sha: result.data.content?.sha,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error from GitHub API";
    return Response.json({ error: message }, { status: 500 });
  }
}
