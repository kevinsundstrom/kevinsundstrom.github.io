import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Synapse",
  description: "Raw knowledge in, finished content out.",
  icons: {
    icon: [
      { url: "/favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
  },
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
