import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ADMIN_COMMANDS,
  COMMANDS,
  COMMAND_GROUPS,
  COMMAND_WEIGHTS,
  commandFields,
  commandsFor,
} from "@/lib/commands";
import { fuzzySearch, fuzzyScore } from "@/lib/fuzzy";

const APP_DIR = join(process.cwd(), "src", "app");

/**
 * Does `path` resolve to a real page?
 *
 * A static segment that has no directory of its own is accepted when its parent
 * holds a dynamic `[param]` sibling, which is how curated literals like
 * `/genre/shounen` legitimately reach `src/app/genre/[name]/page.tsx`. That is
 * looser than the router, but it still catches the failures that actually
 * matter: a typo, a renamed route, or a link to a page that never existed.
 */
function resolvesToPage(path: string): boolean {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "");
  const segments = clean.split("/").filter(Boolean);

  let dir = APP_DIR;
  for (const segment of segments) {
    const literal = join(dir, segment);
    if (existsSync(literal)) {
      dir = literal;
      continue;
    }
    // Fall back to a dynamic segment in the same position.
    const dynamic = COMMAND_SAFE_READDIR(dir).find((entry) => entry.startsWith("["));
    if (!dynamic) return false;
    dir = join(dir, dynamic);
  }
  return existsSync(join(dir, "page.tsx"));
}

function COMMAND_SAFE_READDIR(dir: string): string[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readdirSync } = require("node:fs") as typeof import("node:fs");
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

const ALL = [...COMMANDS, ...ADMIN_COMMANDS];

describe("command registry integrity", () => {
  it("has no duplicate ids", () => {
    const ids = ALL.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every command a label and an absolute path", () => {
    for (const c of ALL) {
      expect(c.label.length, `${c.id} needs a label`).toBeGreaterThan(0);
      expect(c.path.startsWith("/"), `${c.id} path must start with "/"`).toBe(true);
    }
  });

  it("only uses known groups", () => {
    for (const c of ALL) {
      expect(COMMAND_GROUPS, `${c.id} has group "${c.group}"`).toContain(c.group);
    }
  });

  it("gives every command keywords, so it is findable by more than its label", () => {
    const missing = ALL.filter((c) => !c.keywords?.trim()).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it("resolves every path to a real page", () => {
    const dead = ALL.filter((c) => !resolvesToPage(c.path)).map((c) => `${c.id} -> ${c.path}`);
    expect(dead).toEqual([]);
  });

  it("does not offer the same path twice under the same group", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const c of ALL) {
      const key = `${c.group}::${c.path}`;
      if (seen.has(key)) dupes.push(`${c.id} duplicates ${seen.get(key)} (${c.path})`);
      else seen.set(key, c.id);
    }
    expect(dupes).toEqual([]);
  });
});

describe("commandsFor", () => {
  it("hides signed-in-only commands from anonymous visitors", () => {
    const anon = commandsFor({ isAuth: false, isAdmin: false });
    expect(anon.find((c) => c.id === "profile")).toBeUndefined();
    expect(anon.find((c) => c.id === "login")).toBeDefined();
  });

  it("shows signed-in commands once authenticated", () => {
    const user = commandsFor({ isAuth: true, isAdmin: false });
    expect(user.find((c) => c.id === "profile")).toBeDefined();
  });

  it("keeps admin commands away from ordinary users", () => {
    const user = commandsFor({ isAuth: true, isAdmin: false });
    expect(user.find((c) => c.id === "admin")).toBeUndefined();
    expect(user.find((c) => c.adminOnly)).toBeUndefined();
  });

  it("grants admin commands to an admin", () => {
    const admin = commandsFor({ isAuth: true, isAdmin: true });
    expect(admin.find((c) => c.id === "admin")).toBeDefined();
    expect(admin.length).toBeGreaterThan(commandsFor({ isAuth: true, isAdmin: false }).length);
  });

  it("never grants admin commands to signed-out visitors", () => {
    // A mis-wired caller that passes isAdmin without isAuth must not surface
    // moderation tooling.
    const anon = commandsFor({ isAuth: false, isAdmin: true });
    expect(anon.find((c) => c.id === "admin")).toBeUndefined();
  });

  it("never duplicates a command that is already in the base list", () => {
    const admin = commandsFor({ isAuth: true, isAdmin: true });
    const ids = admin.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("commands are discoverable", () => {
  const search = (q: string) =>
    fuzzySearch(q, COMMANDS, {
      fields: commandFields,
      weights: COMMAND_WEIGHTS,
      threshold: 20,
      limit: 5,
    });

  const topId = (q: string) => search(q)[0]?.item.id;
  const topIds = (q: string) => search(q).map((h) => h.item.id);

  it.each([
    ["wl", "watchlist"],
    ["watch lst", "watchlist"],
    ["trending", "top-anime"],
    ["best anime", "top-anime"],
    ["wallpa", "wallpapers"],
    ["news", "news"],
    ["oscar", "awards"],
    ["dm", "messages"],
    ["comic", "manga"],
    ["tv sched", "tv-schedule"],
  ])('"%s" surfaces %s first', (query, expected) => {
    expect(topId(query)).toBe(expected);
  });

  it("matches a spaced-out query against an unspaced label", () => {
    // Regression guard: people type "watch lst", and a literal space can never
    // appear inside "Watchlist". Spaces must be ignored while still hinting at
    // word boundaries through the boundary bonus.
    expect(topId("watch lst")).toBe("watchlist");
  });

  it("does not let a generic keyword outrank the label it belongs to", () => {
    // Backlog used to list "unwatched pile list" as keywords. The stray "list"
    // matched "watch lst" on its own and, with the keyword weight, beat
    // Watchlist itself. Keywords have to be worth more than the label or this
    // regresses.
    const backlog = COMMANDS.find((c) => c.id === "backlog")!;
    expect(fuzzyScore("watch lst", backlog.keywords ?? "")).toBeNull();
  });

  it("ranks the canonical filler page in the top two for 'filler'", () => {
    // "Filler Finder" and the "Filler Time" tool are both legitimate answers
    // here and the scores are close, so assert membership rather than a brittle
    // exact ordering between two genuinely equivalent results.
    expect(topIds("filler").slice(0, 2)).toContain("filler");
  });

  it("returns nothing for a query that matches nothing", () => {
    expect(search("qqqzzzxx")).toEqual([]);
  });
});