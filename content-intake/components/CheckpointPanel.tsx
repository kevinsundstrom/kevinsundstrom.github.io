"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  slug: string;
  prNumber: number;
  onApproved: () => void;
}

export default function CheckpointPanel({ slug, prNumber, onApproved }: Props) {
  const [outline, setOutline] = useState<string | null>(null);
  const [coverageMap, setCoverageMap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pipeline/${encodeURIComponent(slug)}/checkpoint`)
      .then((r) => r.json())
      .then((data) => {
        setOutline(data.outline ?? null);
        setCoverageMap(data.coverageMap ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pipeline/${encodeURIComponent(slug)}/checkpoint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prNumber }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approval failed");
      setApproved(true);
      onApproved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-xs text-gray-500 animate-pulse">
        Loading outline and coverage map…
      </p>
    );
  }

  if (approved) {
    return (
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-green-400">
        Approved — draft is running.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {coverageMap && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Coverage map
          </p>
          <div className="rounded-lg bg-gray-800 px-4 py-3 text-xs text-gray-200 overflow-y-auto max-h-48 prose prose-invert prose-xs">
            <ReactMarkdown>{coverageMap}</ReactMarkdown>
          </div>
        </div>
      )}

      {outline && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Outline
          </p>
          <div className="rounded-lg bg-gray-800 px-4 py-3 text-xs text-gray-200 overflow-y-auto max-h-64 prose prose-invert prose-xs">
            <ReactMarkdown>{outline}</ReactMarkdown>
          </div>
        </div>
      )}

      {!outline && !coverageMap && (
        <p className="text-xs text-gray-500">
          Outputs not yet available — the orchestrator may still be running.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        onClick={handleApprove}
        disabled={approving || (!outline && !coverageMap)}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        {approving ? "Approving…" : "Approve outline"}
      </button>
    </div>
  );
}
