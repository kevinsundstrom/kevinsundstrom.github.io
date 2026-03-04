import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [conv] = await db
    .insert(conversations)
    .values({ userId: session.user.id })
    .returning();

  return (
    <div className="flex-1 flex overflow-hidden">
      <ChatInterface
        conversationId={conv.id}
        isOwner={session.user.githubLogin === "kevinsundstrom"}
      />
    </div>
  );
}
