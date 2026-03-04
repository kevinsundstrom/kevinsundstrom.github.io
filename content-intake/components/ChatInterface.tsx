"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface StoredMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Props {
  conversationId: string;
  isOwner?: boolean;
  initialMessages?: StoredMessage[];
}

export default function ChatInterface({ conversationId, isOwner, initialMessages }: Props) {
  const router = useRouter();
  const [demoMode, setDemoMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("demoMode") === "true";
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages, data } =
    useChat({
      api: "/api/chat",
      body: { conversationId, demoMode },
    });

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const titleRefreshed = useRef(false);

  function toggleDemo() {
    setDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem("demoMode", String(next));
      return next;
    });
  }

  // When a commit succeeds, end the session and start a new one
  useEffect(() => {
    if (!data?.length) return;
    const last = data[data.length - 1] as { sessionCommitted?: boolean };
    if (last?.sessionCommitted) {
      fetch("/api/conversations", { method: "POST" })
        .then((r) => r.json())
        .then((conv) => router.push(`/chat/${conv.id}`));
    }
  }, [data, router]);

  // Load persisted messages on mount
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(
        initialMessages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: new Date(m.createdAt),
        }))
      );
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // After first exchange completes, refresh server components so sidebar shows the generated title
  useEffect(() => {
    if (!isLoading && messages.length >= 2 && !titleRefreshed.current) {
      titleRefreshed.current = true;
      setTimeout(() => router.refresh(), 1500);
    }
  }, [isLoading, messages.length, router]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileStatus(`Reading ${file.name}…`);
    const text = await file.text();
    setFileStatus(null);

    await append({
      role: "user",
      content: `I'm uploading a transcript file named "${file.name}":\n\n${text}`,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-6">
      {/* Header */}
      <div className="py-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">Synapse</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Start a brief, upload a transcript, or contribute knowledge.
          </p>
        </div>
        {isOwner && (
          <button
            onClick={toggleDemo}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              demoMode
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                : "bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${demoMode ? "bg-yellow-400" : "bg-gray-600"}`} />
            {demoMode ? "Demo on" : "Demo"}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 pr-4 space-y-5">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm">
            <p>You can:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Upload a transcript file using the button below</li>
              <li>Paste transcript text directly into the chat</li>
              <li>Describe a piece of content you want to brief out</li>
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words min-w-0 ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              {m.role === "user" ? (
                <span className="whitespace-pre-wrap">{m.content}</span>
              ) : (
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-400 hover:text-blue-300"
                      >
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    code: ({ children }) => (
                      <code className="bg-gray-700 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-700 rounded p-3 text-xs font-mono overflow-x-auto mb-2 whitespace-pre-wrap">{children}</pre>
                    ),
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3 text-sm text-gray-400">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="py-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 flex flex-col gap-2">
            {fileStatus && (
              <p className="text-xs text-gray-500 px-1">{fileStatus}</p>
            )}
            <textarea
              className="w-full bg-gray-800 text-gray-100 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-600 placeholder-gray-500"
              rows={3}
              placeholder="Type a message…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-xl text-sm transition-colors"
              title="Upload transcript"
            >
              Upload
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm transition-colors"
            >
              Send
            </button>
          </div>
        </form>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
