"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState, ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";

interface StoredMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Props {
  conversationId: string;
  initialMessages?: StoredMessage[];
}

export default function ChatInterface({ conversationId, initialMessages }: Props) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append, setMessages } =
    useChat({
      api: "/api/chat",
      body: { conversationId },
    });

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileStatus, setFileStatus] = useState<string | null>(null);

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
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4">
      {/* Header */}
      <div className="py-5 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-gray-100">Content intake</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a transcript or start a brief.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
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
