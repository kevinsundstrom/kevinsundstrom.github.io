"use client";

import { useEffect, useState } from "react";
import CheckpointPanel from "@/components/CheckpointPanel";

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

export default function PipelinePoller({ initial }: { initial: SlugStatus[] }) {
  const [statuses, setStatuses] = useState<SlugStatus[]>(initial);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/pipeline");
        if (res.ok) setStatuses(await res.json());
      } catch {
        // silently ignore polling errors
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  if (statuses.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        Nothing in production yet. Submit a brief to get started.
      </p>
    );
  }

  return (
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

          {s.checkpoint2Pr && (
            <a
              href={s.checkpoint2Pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline block"
            >
              Checkpoint 2 PR #{s.checkpoint2Pr.number}
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
        </div>
      ))}
    </div>
  );
}
