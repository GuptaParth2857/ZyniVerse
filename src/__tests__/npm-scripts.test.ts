import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * Guards the npm scripts themselves.
 *
 * `npm run build` chained through `npm run build:sw` for a commit, and the
 * `build:sw` key was never actually added - a silent insert failure. The build
 * script had been edited to depend on a script that did not exist, and the only
 * symptom was `npm error Missing script` at deploy time. Nothing else in the
 * repo could see it: the tests passed, typecheck passed, lint passed, and the
 * dev server ran fine, because `dev` does not go through `build`.
 *
 * A package.json typo is invisible to every other check here, so it gets its own.
 */

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8")
) as { scripts: Record<string, string> };

const scripts = pkg.scripts;

describe("npm scripts", () => {
  it("every `npm run X` inside a script resolves to a real script", () => {
    // The check that would have caught the missing build:sw.
    const referenced: Array<{ from: string; wants: string }> = [];
    for (const [name, body] of Object.entries(scripts)) {
      for (const match of body.matchAll(/npm run ([\w:-]+)/g)) {
        referenced.push({ from: name, wants: match[1] });
      }
    }

    expect(referenced.length, "expected at least one npm run reference to check").toBeGreaterThan(0);
    const dangling = referenced.filter((r) => !(r.wants in scripts));
    expect(
      dangling.map((d) => `${d.from} -> npm run ${d.wants}`),
      "these scripts call a script that does not exist"
    ).toEqual([]);
  });

  it("build regenerates the service worker before Next compiles", () => {
    // public/sw.js is generated. If `build` stops running build:sw, the worker
    // silently stops tracking src/lib/offline-policy.ts and the only warning is
    // the freshness test, which does not run in CI on this repo.
    expect(scripts.build).toContain("npm run build:sw");
    expect(scripts.build).toContain("next build");
    expect(
      scripts.build.indexOf("npm run build:sw"),
      "the worker must be generated before next build reads it"
    ).toBeLessThan(scripts.build.indexOf("next build"));
  });

  it("build:sw points at the generator that actually exists", () => {
    expect(scripts["build:sw"]).toContain("scripts/build-sw.ts");
    expect(() => readFileSync(join(process.cwd(), "scripts", "build-sw.ts"))).not.toThrow();
  });

  it("no script name is duplicated", () => {
    // JSON.parse silently keeps the last of a duplicate key, so a duplicate is
    // another way to have a script that "exists" but does not do what you meant.
    const raw = readFileSync(join(process.cwd(), "package.json"), "utf8");
    const names = [...raw.matchAll(/^ {6}"([\w:-]+)":/gm)].map((m) => m[1]);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, "duplicate keys are silently collapsed by JSON.parse").toEqual([]);
  });
});