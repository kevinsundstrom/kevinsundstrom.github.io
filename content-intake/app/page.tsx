"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function init() {
      const [listRes, sessionRes] = await Promise.all([
        fetch("/api/conversations"),
        fetch("/api/auth/session"),
      ]);

      if (listRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      const [convs, sessionData] = await Promise.all([
        listRes.json(),
        sessionRes.json(),
      ]);

      setIsOwner(sessionData?.user?.githubLogin === "kevinsundstrom");

      const active = convs.find((c: { status: string }) => c.status === "active");
      if (active) {
        router.replace(`/chat/${active.id}`);
      } else {
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
      <ChatInterface conversationId={conversationId} isOwner={isOwner} />
    </div>
  );
}
