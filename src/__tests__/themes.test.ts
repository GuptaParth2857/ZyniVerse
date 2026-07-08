import { describe, it, expect } from "vitest";
import { THEMES } from "@/lib/themes";

describe("THEMES", () => {
  it("has exactly 3 themes (dark, dim, light)", () => {
    expect(THEMES).toHaveLength(3);
    expect(THEMES.map((t) => t.id)).toEqual(["dark", "dim", "light"]);
  });

  it("each theme has required fields", () => {
    for (const t of THEMES) {
      expect(t).toHaveProperty("label");
      expect(t).toHaveProperty("icon");
      expect(t).toHaveProperty("vars");
      expect(Object.keys(t.vars).length).toBeGreaterThanOrEqual(6);
    }
  });

  it("dark theme has correct void color", () => {
    const dark = THEMES.find((t) => t.id === "dark");
    expect(dark!.vars["--color-void"]).toBe("#0a0a0f");
  });

  it("all themes have valid CSS variable names", () => {
    for (const t of THEMES) {
      for (const key of Object.keys(t.vars)) {
        expect(key).toMatch(/^--[a-z-]+$/);
      }
    }
  });
});
