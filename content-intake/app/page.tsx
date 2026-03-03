"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const listRes = await fetch("/api/conversations");
      if (listRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const convs = await listRes.json();

      if (convs.length > 0) {
        // Load the most recent conversation
        router.replace(`/chat/${convs[0].id}`);
      } else {
        // No conversations yet — create one
        const createRes = await fetch("/api/conversations", { method: "POST" });
        const data = await createRes.json();
        if (data?.id) setConversationId(data.id);
      }
    }

    init();
  }, [router]);

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
