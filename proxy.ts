/* ── Next.js Route Protection Proxy ─────────────────────── *
 * Runs on every non-static request before rendering.        *
 * Uses an __feel_authed cookie (set client-side after       *
 * Firebase login) for optimistic protection.               *
 * The real security lives in Firebase Security Rules.      *
 * ────────────────────────────────────────────────────────── */
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/settings"];
const AUTH_ROUTES      = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read the optimistic auth cookie set by the client after Firebase login
  const isAuthenticated = req.cookies.has("__feel_authed");

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute  = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login/register
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files and Next internals to avoid touching chunk/css/service-worker requests
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
