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
  "checkpoint-1-open": "Checkpoint 1 — needs approval",
  "checkpoint-2-open": "Checkpoint 2 — needs approval",
  complete: "Complete",
};

const STAGE_COLOR: Record<string, string> = {
  committed: "text-gray-400",
  running: "text-yellow-400",
  "checkpoint-1-open": "text-blue-400",
  "checkpoint-2-open": "text-blue-400",
  complete: "text-green-400",
};

export default function PipelinePoller({
  initial,
}: {
  initial: SlugStatus[];
}) {
  const [statuses, setStatuses] = useState<SlugStatus[]>(initial);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/pipeline");
        if (res.ok) {
          const data = await res.json();
          setStatuses(data);
        }
      } catch {
        // silently ignore polling errors
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  if (statuses.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No briefs committed yet. Start a conversation to create one.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {statuses.map((s) => (
        <div
          key={s.slug}
          className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-100">{s.slug}</span>
            <span className={`text-xs font-medium ${STAGE_COLOR[s.stage] ?? "text-gray-400"}`}>
              {STAGE_LABEL[s.stage] ?? s.stage}
            </span>
          </div>

          {s.checkpoint1Pr && s.stage !== "checkpoint-1-open" && (
            <a
              href={s.checkpoint1Pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              Checkpoint 1 PR #{s.checkpoint1Pr.number}
            </a>
          )}

          {s.checkpoint2Pr && (
            <a
              href={s.checkpoint2Pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
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
