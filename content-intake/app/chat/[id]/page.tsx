import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
    )
    .limit(1);

  if (!conv) notFound();

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return (
    <div className="flex-1 flex overflow-hidden">
      <ChatInterface
        conversationId={id}
        initialMessages={history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
