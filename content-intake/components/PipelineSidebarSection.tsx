"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SlugStatus {
  slug: string;
  stage: string;
}

function StatusDot({ stage }: { stage: string }) {
  const base = "w-1.5 h-1.5 rounded-full flex-shrink-0";
  if (stage === "complete") return <span className={`${base} bg-green-500`} />;
  if (stage === "running") return <span className={`${base} bg-yellow-400 animate-pulse`} />;
  if (stage === "checkpoint-1-open" || stage === "checkpoint-2-open")
    return <span className={`${base} bg-yellow-400`} />;
  return <span className={`${base} bg-gray-600`} />;
}

export default function PipelineSidebarSection() {
  const [statuses, setStatuses] = useState<SlugStatus[]>([]);

  useEffect(() => {
    fetch("/api/pipeline")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setStatuses(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-0.5">
      <Link
        href="/pipeline"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
      >
        In production
      </Link>
      {statuses.map((s) => (
        <Link
          key={s.slug}
          href="/pipeline"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors min-w-0"
        >
          <StatusDot stage={s.stage} />
          <span className="truncate">{s.slug}</span>
        </Link>
      ))}
    </div>
  );
}
