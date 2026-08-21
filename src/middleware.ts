import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/portal"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const sessionToken =
  request.cookies.get("__Secure-better-auth.session_token")?.value ??
  request.cookies.get("better-auth.session_token")?.value;

if (!sessionToken) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
