import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Content intake",
  description: "Chat-based intake for the multi-agent content pipeline",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased flex h-screen overflow-hidden">
        {session?.user && <Sidebar />}
        <main className="flex-1 flex overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
