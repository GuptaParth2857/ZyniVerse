import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import ta from "@/locales/ta.json";
import te from "@/locales/te.json";

export type Language = "en" | "hi" | "ta" | "te";

interface LocaleStrings {
  [key: string]: string;
}

const LOCALES: Record<Language, LocaleStrings> = { en, hi, ta, te };

const LANGUAGE_NAMES: Record<Language, { name: string; nativeName: string }> = {
  en: { name: "English", nativeName: "English" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  ta: { name: "Tamil", nativeName: "தமிழ்" },
  te: { name: "Telugu", nativeName: "తెలుగు" },
};

const COOKIE_KEY = "zyni-locale";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  const langs = navigator.languages ?? [navigator.language];
  for (const lang of langs) {
    const code = lang.split("-")[0].toLowerCase();
    if (code === "hi") return "hi";
    if (code === "ta") return "ta";
    if (code === "te") return "te";
  }
  return "en";
}

export function getCurrentLocale(): Language {
  if (typeof window === "undefined") return "en";

  const cookie = getCookie(COOKIE_KEY);
  if (cookie && cookie in LOCALES) return cookie as Language;

  const stored = localStorage.getItem(COOKIE_KEY);
  if (stored && stored in LOCALES) return stored as Language;

  return detectBrowserLanguage();
}

export function setLocale(locale: Language): void {
  setCookie(COOKIE_KEY, locale);
  try {
    localStorage.setItem(COOKIE_KEY, locale);
  } catch {}
  window.location.reload();
}

export function t(key: string, params?: Record<string, string>): string {
  const locale = getCurrentLocale();
  let value = LOCALES[locale]?.[key];
  if (!value) value = LOCALES.en?.[key];
  if (!value) return key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
  }

  return value;
}

export function getAvailableLocales(): { code: Language; name: string; nativeName: string }[] {
  return (Object.keys(LOCALES) as Language[]).map((code) => ({
    code,
    ...LANGUAGE_NAMES[code],
  }));
}

export function isRTL(_locale: Language): boolean {
  void _locale;
  return false;
}

export function formatNumber(n: number, locale: Language): string {
  try {
    return new Intl.NumberFormat(locale).format(n);
  } catch {
    return n.toLocaleString();
  }
}

export function formatDate(date: Date, locale: Language): string {
  try {
    return new Intl.DateTimeFormat(locale).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
