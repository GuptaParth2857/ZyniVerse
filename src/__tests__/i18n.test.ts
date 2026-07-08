import { describe, it, expect, vi, beforeEach } from "vitest";
import { t, getAvailableLocales, formatNumber, formatDate, isRTL, type Language } from "@/lib/i18n";

vi.mock("@/locales/en.json", () => ({ default: { welcome: "Welcome", greeting: "Hello {name}!" } }));
vi.mock("@/locales/hi.json", () => ({ default: { welcome: "स्वागत है" } }));
vi.mock("@/locales/ta.json", () => ({ default: { welcome: "வரவேற்கிறோம்" } }));
vi.mock("@/locales/te.json", () => ({ default: { welcome: "స్వాగతం" } }));

const mockNavigatorLanguage = (lang: string) => {
  Object.defineProperty(globalThis, "navigator", {
    value: { language: lang, languages: [lang] },
    writable: true,
    configurable: true,
  });
};

beforeEach(() => {
  vi.stubGlobal("document", undefined);
  vi.stubGlobal("window", undefined);
  vi.stubGlobal("navigator", { language: "en-US", languages: ["en-US"] });
});

describe("getAvailableLocales", () => {
  it("returns all 4 locales", () => {
    const locales = getAvailableLocales();
    expect(locales).toHaveLength(4);
    const codes = locales.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("hi");
    expect(codes).toContain("ta");
    expect(codes).toContain("te");
  });

  it("each locale has name and nativeName", () => {
    for (const l of getAvailableLocales()) {
      expect(l).toHaveProperty("name");
      expect(l).toHaveProperty("nativeName");
    }
  });
});

describe("t (translation)", () => {
  it("returns translation for existing key in current locale", () => {
    expect(t("welcome")).toBe("Welcome");
  });

  it("falls back to English when key missing in other locale", () => {
    // Hindi doesn't have "greeting"
    mockNavigatorLanguage("hi");
    const result = t("greeting", { name: "Test" });
    expect(result).toBe("Hello Test!");
  });

  it("returns key when not found in any locale", () => {
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("replaces params in template strings", () => {
    expect(t("greeting", { name: "World" })).toBe("Hello World!");
    expect(t("greeting", { name: "ZyniVerse" })).toBe("Hello ZyniVerse!");
  });
});

describe("isRTL", () => {
  it("returns false for all supported locales", () => {
    for (const code of ["en", "hi", "ta", "te"] as Language[]) {
      expect(isRTL(code)).toBe(false);
    }
  });
});

describe("formatNumber", () => {
  it("formats numbers using locale", () => {
    const result = formatNumber(1000, "en");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDate", () => {
  it("formats dates using locale", () => {
    const result = formatDate(new Date("2026-01-01"), "en");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
