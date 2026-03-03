import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GitHub({
      authorization: {
        params: { scope: "read:user user:email" },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      try {
        const row = await db
          .select({ githubLogin: users.githubLogin })
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);
        session.user.githubLogin = row[0]?.githubLogin ?? null;
      } catch {
        session.user.githubLogin = null;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "github" && profile?.login && user.id) {
          await db
            .update(users)
            .set({ githubLogin: profile.login as string })
            .where(eq(users.id, user.id));
        }
      } catch {
        // non-fatal — sign-in still succeeds
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
