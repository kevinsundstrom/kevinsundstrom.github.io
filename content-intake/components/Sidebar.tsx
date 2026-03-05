import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";

function StatusDot({ status }: { status: string }) {
  const base = "w-1.5 h-1.5 rounded-full flex-shrink-0";
  if (status === "complete") return <span className={`${base} bg-green-500`} />;
  if (status === "committed") return <span className={`${base} bg-yellow-400`} />;
  return <span className={`${base} bg-gray-600`} />;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const recent = await db
    .select({
      id: conversations.id,
      briefSlug: conversations.briefSlug,
      title: conversations.title,
      status: conversations.status,
      createdAt: conversations.createdAt,
      firstUserMessage: sql<string>`min(case when ${messages.role} = 'user' then ${messages.content} end)`,
    })
    .from(conversations)
    .innerJoin(messages, eq(messages.conversationId, conversations.id))
    .where(eq(conversations.userId, session.user.id))
    .groupBy(conversations.id, conversations.briefSlug, conversations.title, conversations.status, conversations.createdAt)
    .orderBy(desc(conversations.createdAt))
    .limit(10);

  return (
    <aside className="w-48 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950">
      {/* Brand */}
      <Link href="/" className="px-4 py-5 border-b border-gray-800 flex items-center gap-2.5 hover:bg-gray-900 transition-colors">
        <svg className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 98 96" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#e6edf3"/>
        </svg>
        <span className="text-sm font-semibold text-gray-100">Synapse</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-4 overflow-y-auto min-h-0">
        {/* New chat */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
        >
          + New chat
        </Link>

        {/* Conversations */}
        <div className="space-y-0.5">
          {recent.map((conv) => {
            const label = conv.briefSlug
              ?? conv.title
              ?? (conv.firstUserMessage ? conv.firstUserMessage.slice(0, 40) : null)
              ?? formatDate(conv.createdAt);
            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors min-w-0"
              >
                <StatusDot status={conv.status} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Pipeline */}
        <div className="space-y-0.5">
          <Link
            href="/pipeline"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
          >
            In production
          </Link>
        </div>
      </nav>

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
