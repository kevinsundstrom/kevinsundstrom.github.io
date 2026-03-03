import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth(function (req) {
  const pathname = req.nextUrl.pathname;
  const isPublic =
    pathname === "/login" || pathname.startsWith("/api/auth");

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
