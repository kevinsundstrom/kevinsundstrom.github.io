"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  slug: string;
}

export default function CompletedDraftPanel({ slug }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pipeline/${encodeURIComponent(slug)}/draft`)
      .then((r) => r.json())
      .then((data) => {
        setDraft(data.draft ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="text-xs text-gray-500 animate-pulse">Loading draft…</p>;
  }

  if (!draft) {
    return null;
  }

  return (
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
  );
}
