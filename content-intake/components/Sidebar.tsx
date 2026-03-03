import { auth, signOut } from "@/auth";
import Link from "next/link";

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return (
    <aside className="w-48 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-gray-800">
        <span className="text-sm font-semibold text-gray-100">Content Foundry</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <Link
          href="/pipeline"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
        >
          In production
        </Link>
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
