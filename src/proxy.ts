import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/login",
  "/api/auth",
  "/api/auth/sign-in",
  "/api/auth/sign-up",
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
