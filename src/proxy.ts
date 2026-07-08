import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "zyni-locale";
const SUPPORTED_LOCALES = ["en", "hi", "ta", "te"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function getLocaleFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "en";
  const preferred = acceptLanguage
    .split(",")
    .map((s) => {
      const [lang, q = "q=1"] = s.trim().split(";");
      return { lang: lang.split("-")[0].toLowerCase(), q: parseFloat(q.split("=")[1] || "1") };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    if (SUPPORTED_LOCALES.includes(lang as Locale)) return lang as Locale;
  }
  return "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for locale prefix in URL (/hi/..., /ta/..., /te/...)
  const pathParts = pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0]?.toLowerCase();

  if (SUPPORTED_LOCALES.includes(firstSegment as Locale) && firstSegment !== "en") {
    const locale = firstSegment as Locale;
    const response = NextResponse.redirect(new URL(pathname.replace(`/${locale}`, "") || "/", request.url));
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }

  // For API routes, set locale based on Accept-Language header
  if (pathname.startsWith("/api/")) {
    const acceptLanguage = request.headers.get("Accept-Language");
    const locale = getLocaleFromAcceptLanguage(acceptLanguage);
    const response = NextResponse.next();
    if (locale !== "en") {
      response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return response;
  }

  // For regular page routes, detect language from Accept-Language if no cookie set
  const existingCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!existingCookie || !SUPPORTED_LOCALES.includes(existingCookie as Locale)) {
    const acceptLanguage = request.headers.get("Accept-Language");
    const locale = getLocaleFromAcceptLanguage(acceptLanguage);
    if (locale !== "en") {
      const response = NextResponse.next();
      response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|manifest.json|icons/).*)",
  ],
};
