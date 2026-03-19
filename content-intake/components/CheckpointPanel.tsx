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
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"approved" | "changes-requested" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
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

  async function handleAction(action: "approve" | "request-changes") {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pipeline/${encodeURIComponent(slug)}/checkpoint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prNumber, action, feedback: feedback.trim() || undefined }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (action === "approve") {
        setDone("approved");
        onApproved();
      } else {
        setDone("changes-requested");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-xs text-gray-500 animate-pulse">
        Loading outline and coverage map…
      </p>
    );
  }

  if (done === "approved") {
    return (
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-green-400">
        Approved — draft is running.
      </div>
    );
  }

  if (done === "changes-requested") {
    return (
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-yellow-400">
        Changes requested — PR closed. Submit a revised brief to restart.
      </div>
    );
  }

  const hasOutputs = !!(outline || coverageMap);

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

      {!hasOutputs && (
        <p className="text-xs text-gray-500">
          Outputs not yet available — planning may still be running.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {showFeedback ? (
        <div className="space-y-2">
          <textarea
            className="w-full bg-gray-800 text-gray-100 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-gray-600 placeholder-gray-500"
            rows={4}
            placeholder="Describe what needs to change…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleAction("request-changes")}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {submitting ? "Sending…" : "Send feedback"}
            </button>
            <button
              onClick={() => { setShowFeedback(false); setFeedback(""); }}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("approve")}
            disabled={submitting || !hasOutputs}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {submitting ? "Approving…" : "Approve outline"}
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            disabled={submitting || !hasOutputs}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm font-medium transition-colors"
          >
            Request changes
          </button>
        </div>
      )}
    </div>
  );
}
