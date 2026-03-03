import { auth } from "@/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, session.user.id))
    .orderBy(desc(conversations.createdAt));

  return Response.json(rows);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [row] = await db
    .insert(conversations)
    .values({ userId: session.user.id })
    .returning();

  return Response.json(row, { status: 201 });
}
