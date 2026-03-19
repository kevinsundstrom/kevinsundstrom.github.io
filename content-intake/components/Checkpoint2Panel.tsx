"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  slug: string;
  prNumber: number;
  onApproved: () => void;
}

export default function Checkpoint2Panel({ slug, prNumber, onApproved }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [done, setDone] = useState<"approved" | "changes-requested" | "rerunning" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pipeline/${encodeURIComponent(slug)}/draft`)
      .then((r) => r.json())
      .then((data) => {
        setDraft(data.draft ?? null);
        setReviewNotes(data.reviewNotes ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleAction(action: "approve" | "request-changes") {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipeline/${encodeURIComponent(slug)}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prNumber, action, feedback: feedback.trim() || undefined }),
      });
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
    return <p className="text-xs text-gray-500 animate-pulse">Loading draft…</p>;
  }

  async function handleRerun() {
    setRerunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/pipeline/${encodeURIComponent(slug)}/rerun-draft`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to re-run");
      setDone("rerunning");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setRerunning(false);
    }
  }

  if (done === "rerunning") {
    return (
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-yellow-400">
        Draft agent is running — check back in a few minutes.
      </div>
    );
  }

  if (done === "approved") {
    return (
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-green-400">
        Draft approved — merged to main.
      </div>
    );
  }

  if (done === "changes-requested") {
    return (
      <div className="rounded-lg bg-gray-800 px-4 py-3 text-sm text-yellow-400">
        Feedback sent — PR closed.
      </div>
    );
  }

  const hasContent = !!(draft || reviewNotes);

  return (
    <div className="space-y-6 pt-2">
      {!hasContent && (
        <p className="text-xs text-gray-500">
          Draft not yet available — the draft agent may still be running.
        </p>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {draft && (
        <div className="border-t border-gray-800 pt-6">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-gray-100 mb-4 leading-tight">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-gray-100 mt-8 mb-3 leading-snug">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-200 mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-gray-300 leading-relaxed mb-4">{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-gray-600 pl-4 my-4 text-gray-400 italic text-sm">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-200">{children}</strong>
              ),
              em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-sm text-gray-300">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-sm text-gray-300">{children}</ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-gray-800 rounded px-1 py-0.5 text-xs font-mono text-gray-300">{children}</code>
              ),
              hr: () => <hr className="border-gray-700 my-6" />,
            }}
          >
            {draft}
          </ReactMarkdown>
        </div>
      )}

      {reviewNotes && (
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showNotes ? "Hide review notes" : "Show review notes"}
          </button>
          {showNotes && (
            <div className="mt-4 rounded-lg bg-gray-800 px-4 py-3 text-xs text-gray-200 overflow-y-auto max-h-64 prose prose-invert prose-xs">
              <ReactMarkdown>{reviewNotes}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

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
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleAction("approve")}
            disabled={submitting || rerunning || !hasContent}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {submitting ? "Approving…" : "Approve draft"}
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            disabled={submitting || rerunning || !hasContent}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm font-medium transition-colors"
          >
            Request changes
          </button>
          <button
            onClick={handleRerun}
            disabled={submitting || rerunning}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 text-sm font-medium transition-colors"
          >
            {rerunning ? "Starting…" : "Re-run draft"}
          </button>
        </div>
      )}
    </div>
  );
}
