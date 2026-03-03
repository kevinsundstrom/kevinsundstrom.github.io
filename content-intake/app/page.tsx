"use client";

import { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conversations", { method: "POST" })
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((data) => { if (data?.id) setConversationId(data.id); });
  }, []);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <ChatInterface conversationId={conversationId} />
    </div>
  );
}
