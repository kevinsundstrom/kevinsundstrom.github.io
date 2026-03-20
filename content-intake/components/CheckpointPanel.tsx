"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Gap {
  id: string;
  section: string;
  description: string;
  resolution: "research" | "approve-thin" | null;
}

interface Props {
  slug: string;
  prNumber: number;
  onApproved: () => void;
}

export default function CheckpointPanel({ slug, prNumber, onApproved }: Props) {
  const [outline, setOutline] = useState<string | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"approved" | "changes-requested" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseGaps = (content: string) => {
    const parsed: Gap[] = [];
    // Split on H2 headings only
    const sections = content.split(/\n(?=## )/);
    for (const section of sections) {
      const headingMatch = section.match(/^## (.+)/);
      if (!headingMatch) continue;
      const heading = headingMatch[1].trim();
      // Skip non-body sections — these headings are machine-generated and deterministic
      if (
        heading === "Notes for the draft agent" ||
        heading === "Sections omitted"
      ) continue;
      // Intentionally uses .match() not .matchAll() — the lean outline format
      // allows at most one [NEEDS SOURCE] marker per section by design.
      const gapMatch = section.match(/\[NEEDS SOURCE:\s*([^\]]+)\]/);
      if (gapMatch) {
        parsed.push({
          id: crypto.randomUUID(),
          section: heading,
          description: gapMatch[1].trim(),
          resolution: null,
        });
      }
    }
    setGaps(parsed);
  };

  useEffect(() => {
    fetch(`/api/pipeline/${encodeURIComponent(slug)}/checkpoint`)
      .then((r) => r.json())
      .then((data) => {
        setOutline(data.outline ?? null);
        if (data.outline) parseGaps(data.outline);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleApprove() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pipeline/${encodeURIComponent(slug)}/checkpoint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            prNumber,
            gaps: gaps.map((g) => ({
              section: g.section,
              description: g.description,
              resolution: g.resolution,
            })),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setDone("approved");
      onApproved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestChanges() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/pipeline/${encodeURIComponent(slug)}/checkpoint`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request-changes",
            prNumber,
            feedback: feedback.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setDone("changes-requested");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <p className="text-xs text-gray-500 animate-pulse">
        Loading outline…
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

  const hasOutputs = !!outline;
  const allGapsResolved = gaps.every((g) => g.resolution !== null);
  const unresolvedCount = gaps.filter((g) => g.resolution === null).length;

  return (
    <div className="space-y-4 pt-2">
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

      {gaps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
            Gaps to resolve ({gaps.filter((g) => g.resolution !== null).length}/{gaps.length} resolved)
          </p>
          <div className="space-y-2">
            {gaps.map((gap) => (
              <div key={gap.id} className="rounded-lg bg-gray-800 px-4 py-3 text-xs">
                <div className="font-medium text-gray-200 mb-1">{gap.section}</div>
                <div className="text-gray-400 mb-2">{gap.description}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setGaps((prev) =>
                        prev.map((g) =>
                          g.id === gap.id ? { ...g, resolution: "research" } : g
                        )
                      )
                    }
                    className={`px-3 py-1 rounded text-xs border transition-colors ${
                      gap.resolution === "research"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    Research from first-party sources
                  </button>
                  <button
                    onClick={() =>
                      setGaps((prev) =>
                        prev.map((g) =>
                          g.id === gap.id ? { ...g, resolution: "approve-thin" } : g
                        )
                      )
                    }
                    className={`px-3 py-1 rounded text-xs border transition-colors ${
                      gap.resolution === "approve-thin"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    Approve thin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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
              onClick={handleRequestChanges}
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
            onClick={handleApprove}
            disabled={submitting || !hasOutputs || !allGapsResolved}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {submitting
              ? "Approving…"
              : gaps.length > 0 && !allGapsResolved
              ? `Resolve ${unresolvedCount} gap${unresolvedCount !== 1 ? "s" : ""} to approve`
              : "Approve outline"}
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
