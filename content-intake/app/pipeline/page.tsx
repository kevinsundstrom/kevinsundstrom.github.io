import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Octokit } from "@octokit/rest";
import { redirect } from "next/navigation";
import PipelinePoller from "./PipelinePoller";

export const dynamic = "force-dynamic";

async function fetchInitialStatuses(userId: string) {
  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId));

  const committed = convs.filter((c) => c.briefSlug);
  if (committed.length === 0) return [];

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.PIPELINE_REPO_OWNER!;
  const repo = process.env.PIPELINE_REPO_NAME!;

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
    // proceed with empty PR list
  }

  return committed.map((conv) => {
    const slug = conv.briefSlug!;

    const c1 = openPrs.find(
      (pr) =>
        pr.labels.some((l) => l.name === "checkpoint-1") &&
        (pr.head.ref.includes(slug) || pr.title.toLowerCase().includes(slug))
    );

    const c2 = openPrs.find(
      (pr) =>
        pr.labels.some((l) => l.name === "checkpoint-2") &&
        (pr.head.ref.includes(slug) || pr.title.toLowerCase().includes(slug))
    );

    let stage = "running";
    if (c2) stage = "checkpoint-2-open";
    else if (c1) stage = "checkpoint-1-open";
    else if (conv.status === "complete") stage = "complete";

    return {
      slug,
      conversationId: conv.id,
      stage,
      checkpoint1Pr: c1 ? { number: c1.number, url: c1.html_url } : null,
      checkpoint2Pr: c2 ? { number: c2.number, url: c2.html_url } : null,
    };
  });
}

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const initial = await fetchInitialStatuses(session.user.id);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-100">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Status of committed briefs. Refreshes every 30 seconds.
        </p>
      </div>

      <PipelinePoller initial={initial} />
    </div>
  );
}
