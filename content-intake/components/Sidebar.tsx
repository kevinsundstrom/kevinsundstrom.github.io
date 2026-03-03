import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, session.user.id))
    .orderBy(desc(conversations.createdAt))
    .limit(50);

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950 overflow-y-auto">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-800">
        <span className="text-sm font-semibold text-gray-100">Content intake</span>
      </div>

      {/* Nav links */}
      <nav className="px-3 py-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
        >
          + New conversation
        </Link>
        <Link
          href="/pipeline"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
        >
          Pipeline
        </Link>
      </nav>

      {/* Conversation list */}
      <div className="flex-1 px-3 py-2 space-y-0.5">
        {convs.map((conv) => (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="block rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors truncate"
          >
            {conv.briefSlug
              ? conv.briefSlug
              : new Date(conv.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            {conv.status !== "active" && (
              <span className="ml-1 text-gray-600">· {conv.status}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-800">
        <p className="px-3 mb-2 text-xs text-gray-600 truncate">
          {session.user.email}
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full text-left rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
