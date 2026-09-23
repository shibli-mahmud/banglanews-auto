import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n";

function getLocaleFromHeader(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("bn")) return "bn";
  return defaultLocale;
}

// PAUSED 2026-09-23 - every request is served the holding page while the
// content pipeline is rebuilt. Set this to false and redeploy to restore
// the site exactly as it was; nothing else below has changed.
const MAINTENANCE_MODE = true;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MAINTENANCE_MODE) {
    if (pathname === "/maintenance") return NextResponse.next();
    const response = NextResponse.rewrite(new URL("/maintenance", request.url));
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Retry-After", "86400");
    return response;
  }
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (
    hasLocalePrefix ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const locale = getLocaleFromHeader(request);
  // Explicitly handle root to avoid edge cases like `//` in redirect paths.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
