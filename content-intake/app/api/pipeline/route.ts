import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq, isNotNull } from "drizzle-orm";
import { Octokit } from "@octokit/rest";

export const runtime = "nodejs";

type PipelineStage =
  | "committed"
  | "running"
  | "checkpoint-1-open"
  | "checkpoint-2-open"
  | "complete";

interface PrRef {
  number: number;
  url: string;
}

interface SlugStatus {
  slug: string;
  conversationId: string;
  stage: PipelineStage;
  checkpoint1Pr: PrRef | null;
  checkpoint2Pr: PrRef | null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, session.user.id));

  const committed = convs.filter((c) => c.briefSlug);
  if (committed.length === 0) {
    return Response.json([]);
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;

  // Fetch open PRs once — filter per slug
  let openPrs: Awaited<ReturnType<typeof octokit.pulls.list>>["data"] = [];
  try {
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 100,
    });
    openPrs = data;
  } catch {
    // If GitHub call fails, return committed status for all
  }

  const results: SlugStatus[] = committed.map((conv) => {
    const slug = conv.briefSlug!;

    const slugSpaces = slug.replace(/-/g, " ");
    const prMatches = (pr: { head: { ref: string }; title: string }) =>
      pr.head.ref.includes(slug) ||
      pr.title.toLowerCase().includes(slug) ||
      pr.title.toLowerCase().includes(slugSpaces);

    const c1 = openPrs.find(
      (pr) => pr.labels.some((l) => l.name === "checkpoint-1") && prMatches(pr)
    );

    const c2 = openPrs.find(
      (pr) => pr.labels.some((l) => l.name === "checkpoint-2") && prMatches(pr)
    );

    let stage: PipelineStage = "running";
    if (c2) {
      stage = "checkpoint-2-open";
    } else if (c1) {
      stage = "checkpoint-1-open";
    } else if (conv.status === "complete") {
      stage = "complete";
    }

    return {
      slug,
      conversationId: conv.id,
      stage,
      checkpoint1Pr: c1 ? { number: c1.number, url: c1.html_url } : null,
      checkpoint2Pr: c2 ? { number: c2.number, url: c2.html_url } : null,
    };
  });

  return Response.json(results);
}
