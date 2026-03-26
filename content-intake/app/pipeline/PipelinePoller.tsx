"use client";

import { useEffect, useState } from "react";
import CheckpointPanel from "@/components/CheckpointPanel";
import Checkpoint2Panel from "@/components/Checkpoint2Panel";
import CompletedDraftPanel from "@/components/CompletedDraftPanel";

interface PrRef {
  number: number;
  url: string;
}

interface SlugStatus {
  slug: string;
  conversationId: string;
  stage: string;
  checkpoint1Pr: PrRef | null;
  checkpoint2Pr: PrRef | null;
}

const STAGE_LABEL: Record<string, string> = {
  committed: "Queued",
  running: "Running",
  "checkpoint-1-open": "Needs approval",
  "checkpoint-2-open": "Needs approval",
  complete: "Complete",
};

// grey = queued, yellow = running/needs action, green = complete
function StatusDot({ stage }: { stage: string }) {
  const base = "w-2.5 h-2.5 rounded-full flex-shrink-0";
  if (stage === "complete") return <span className={`${base} bg-green-500`} />;
  if (stage === "running") return <span className={`${base} bg-yellow-400 animate-pulse`} />;
  if (stage === "checkpoint-1-open" || stage === "checkpoint-2-open")
    return <span className={`${base} bg-yellow-400`} />;
  // committed / queued
  return <span className={`${base} bg-gray-600`} />;
}

function AbandonButton({ slug, onAbandoned }: { slug: string; onAbandoned: () => void }) {
  const [state, setState] = useState<"idle" | "confirming" | "running">("idle");

  async function handleConfirm() {
    setState("running");
    try {
      await fetch(`/api/pipeline/${encodeURIComponent(slug)}/abandon`, { method: "POST" });
      onAbandoned();
    } catch {
      setState("idle");
    }
  }

  if (state === "running") {
    return <span className="text-xs text-gray-500">Abandoning…</span>;
  }

  if (state === "confirming") {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Abandon this brief? This cannot be undone.</span>
        <button onClick={handleConfirm} className="text-xs text-red-400 hover:text-red-300">Yes, abandon</button>
        <button onClick={() => setState("idle")} className="text-xs text-gray-500 hover:text-gray-400">Cancel</button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setState("confirming")}
      className="text-xs text-gray-600 hover:text-red-400 transition-colors"
    >
      Abandon brief
    </button>
  );
}

function RerunPlanningButton({ slug, onRerun }: { slug: string; onRerun: () => void }) {
  const [state, setState] = useState<"idle" | "confirming" | "running">("idle");

  async function handleConfirm() {
    setState("running");
    try {
      await fetch(`/api/pipeline/${encodeURIComponent(slug)}/rerun-planning`, { method: "POST" });
      onRerun();
    } catch {
      setState("idle");
    }
  }

  if (state === "running") {
    return <span className="text-xs text-gray-500">Re-running from planning…</span>;
  }

  if (state === "confirming") {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Re-run from planning?</span>
        <button onClick={handleConfirm} className="text-xs text-yellow-400 hover:text-yellow-300">Yes</button>
        <button onClick={() => setState("idle")} className="text-xs text-gray-500 hover:text-gray-400">Cancel</button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setState("confirming")}
      className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
    >
      Re-run from planning
    </button>
  );
}

export default function PipelinePoller({ initial }: { initial: SlugStatus[] }) {
  const [statuses, setStatuses] = useState<SlugStatus[]>(initial);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/pipeline");
      if (res.ok) setStatuses(await res.json());
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">In production</h1>
          <p className="text-sm text-gray-500 mt-0.5">Auto-refreshes every 15 seconds.</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-40 transition-colors"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {statuses.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gray-700" />
            <span className="text-sm text-gray-500">Nothing in production yet. Submit a brief to get started.</span>
          </div>
        </div>
      )}

    <div className="space-y-3">
      {statuses.map((s) => (
        <div
          key={s.slug}
          className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <StatusDot stage={s.stage} />
            <span className="font-mono text-sm text-gray-100 flex-1 truncate">{s.slug}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {STAGE_LABEL[s.stage] ?? s.stage}
            </span>
          </div>

          {s.checkpoint1Pr && s.stage !== "checkpoint-1-open" && (
            <a
              href={s.checkpoint1Pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline block"
            >
              Checkpoint 1 PR #{s.checkpoint1Pr.number}
            </a>
          )}

          {s.stage === "checkpoint-1-open" && s.checkpoint1Pr && (
            <CheckpointPanel
              slug={s.slug}
              prNumber={s.checkpoint1Pr.number}
              onApproved={() =>
                setStatuses((prev) =>
                  prev.map((x) =>
                    x.slug === s.slug ? { ...x, stage: "running" } : x
                  )
                )
              }
            />
          )}

          {s.stage === "checkpoint-2-open" && s.checkpoint2Pr && (
            <Checkpoint2Panel
              slug={s.slug}
              prNumber={s.checkpoint2Pr.number}
              onApproved={() =>
                setStatuses((prev) =>
                  prev.map((x) =>
                    x.slug === s.slug ? { ...x, stage: "complete" } : x
                  )
                )
              }
            />
          )}

          {s.stage === "complete" && <CompletedDraftPanel slug={s.slug} />}

          {(s.stage === "complete" || s.stage === "running" || s.stage === "checkpoint-2-open" || s.stage === "checkpoint-1-open") && (
            <div className="pt-1 flex items-center gap-4">
              <RerunPlanningButton
                slug={s.slug}
                onRerun={() =>
                  setStatuses((prev) =>
                    prev.map((x) =>
                      x.slug === s.slug ? { ...x, stage: "running" } : x
                    )
                  )
                }
              />
              <AbandonButton
                slug={s.slug}
                onAbandoned={() =>
                  setStatuses((prev) => prev.filter((x) => x.slug !== s.slug))
                }
              />
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  );
}
