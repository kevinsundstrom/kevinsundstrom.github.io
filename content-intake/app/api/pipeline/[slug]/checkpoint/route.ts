import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Octokit } from "@octokit/rest";

export const runtime = "nodejs";

async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
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

  // Use service token for reads — read-only and repo already accessible
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const [outline, coverageMap] = await Promise.all([
    getFileContent(octokit, owner, repo, `outputs/${slug}/outline.md`),
    getFileContent(octokit, owner, repo, `outputs/${slug}/coverage-map.md`),
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

  const { prNumber } = await req.json();
  if (!prNumber) {
    return Response.json({ error: "prNumber required" }, { status: 400 });
  }

  // Use the user's OAuth token so the merge shows their name on GitHub
  const [account] = await db
    .select({ access_token: accounts.access_token })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, session.user.id),
        eq(accounts.provider, "github")
      )
    )
    .limit(1);

  const githubToken = account?.access_token;
  if (!githubToken) {
    return Response.json({ error: "No GitHub token found" }, { status: 400 });
  }

  const octokit = new Octokit({ auth: githubToken });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;
  const { slug } = await params;

  try {
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
