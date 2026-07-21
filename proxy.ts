import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: Parameters<typeof intlMiddleware>[0]) {
  // The bare root "/" is reserved for the language-picker landing page
  // (app/page.tsx) — don't let next-intl redirect it into a locale.
  // Every other path (including "/tours" with no prefix) still gets routed
  // to the right locale as normal.
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }
  return intlMiddleware(request);
}

export const config = {
  // Run on every public page, but skip:
  // - /admin (its own single-language dashboard, not translated)
  // - /api, /_next, /_vercel (framework internals)
  // - any request for a file with an extension (images, favicon, etc.)
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};
