import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const [conv] = await db
    .select()
    .from(conversations)
    .where(
      and(eq(conversations.id, id), eq(conversations.userId, session.user.id))
    )
    .limit(1);

  if (!conv) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return Response.json(rows);
}
