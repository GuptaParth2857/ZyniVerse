import { describe, expect, it } from "vitest";
import { fuzzyScore, fuzzySearch, highlight, normalize } from "@/lib/fuzzy";

/**
 * Score that must exist. Failing loudly here beats `expect(null).toBeGreaterThan(x)`,
 * which reports "expected null to be greater than 800" instead of naming the
 * query and target that should have matched.
 */
function score(q: string, t: string): number {
  const hit = fuzzyScore(q, t);
  if (!hit) throw new Error(`expected ${JSON.stringify(q)} to match ${JSON.stringify(t)}`);
  return hit.score;
}

describe("normalize", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalize("  Most   POPULAR ")).toBe("most popular");
  });

  it("strips diacritics", () => {
    expect(normalize("Shingeki no Kyojin")).toBe("shingeki no kyojin");
    expect(normalize("Pokémon")).toBe("pokemon");
  });
});

describe("fuzzyScore ranking", () => {
  it("rejects a query whose letters are absent", () => {
    expect(fuzzyScore("zzz", "anime")).toBeNull();
  });

  it("rejects out-of-order subsequences", () => {
    expect(fuzzyScore("nma", "anime")).toBeNull();
  });

  it("ranks exact above prefix above substring above subsequence", () => {
    const exact = score("search", "search");
    const prefix = score("search", "search filters");
    const substring = score("search", "unified search api");
    const subseq = score("srch", "unified search api");

    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(substring);
    expect(substring).toBeGreaterThan(subseq);
  });

  it("prefers a shorter prefix over a longer one", () => {
    expect(score("sea", "search")).toBeGreaterThan(
      score("sea", "search everything anime related")
    );
  });

  it("prefers an early substring over a late one", () => {
    expect(score("api", "api routes")).toBeGreaterThan(score("api", "routes for api"));
  });
});

describe("fuzzyScore subsequence quality", () => {
  it("matches initials across words", () => {
    // "gt" -> "Guess the OST"
    expect(fuzzyScore("gt", "guess the ost")).not.toBeNull();
  });

  it("matches a subsequence that does not start on a word boundary", () => {
    // Regression guard: the naive "only start at boundaries" implementation
    // fails this one, because the only `t` in "controls" is mid-word.
    expect(fuzzyScore("ctrls", "controls")).not.toBeNull();
  });

  it("prefers a word-boundary start over a mid-word one", () => {
    expect(score("an", "anime database")).toBeGreaterThan(
      score("an", "banned history")
    );
  });

  it("prefers consecutive characters over scattered ones", () => {
    expect(score("post", "posts")).toBeGreaterThan(score("post", "p o s t"));
  });

  it("reports the matched indices in order", () => {
    const hit = fuzzyScore("srch", "unified search api");
    expect(hit).not.toBeNull();
    const picked = hit!.indices.map((i) => "unified search api"[i]).join("");
    expect(picked).toBe("srch");
  });

  it("prefers the boundary occurrence of a character", () => {
    // `n` exists in "night" at a word start and again mid-word in "nine".
    const hit = fuzzyScore("ngt", "night")!;
    expect(hit.indices[0]).toBe(0);
  });

  it("ignores the query's spaces when matching a single word", () => {
    // "watch lst" cannot match "watchlist" if the space is treated literally,
    // because there is no space inside it. The dropped-space path exists purely
    // so ordinary typed queries still resolve.
    expect(fuzzyScore("watch lst", "watchlist")).not.toBeNull();
    expect(fuzzyScore("top anime", "topanime")).not.toBeNull();
  });

  it("still requires every non-space character to be present", () => {
    expect(fuzzyScore("watch zzz", "watchlist")).toBeNull();
  });
});

describe("fuzzySearch", () => {
  const items = [
    { label: "Trending Anime", path: "/top-anime", keywords: "popular hot" },
    { label: "Most Popular", path: "/search", keywords: "all time ranking" },
    { label: "Top Anime", path: "/top-anime", keywords: "best ranked" },
    { label: "Watchlist", path: "/watchlist", keywords: "my anime list" },
  ];
  const fields = (i: (typeof items)[number]) => ({
    label: i.label,
    path: i.path,
    keywords: i.keywords,
  });

  it("returns nothing for an empty query", () => {
    expect(fuzzySearch("", items, { fields })).toEqual([]);
    expect(fuzzySearch("   ", items, { fields })).toEqual([]);
  });

  it("orders the strongest match first", () => {
    const hits = fuzzySearch("watchlist", items, { fields });
    expect(hits[0].item.label).toBe("Watchlist");
  });

  it("matches on a secondary field, not just the label", () => {
    const hits = fuzzySearch("my anime list", items, { fields });
    expect(hits[0].item.label).toBe("Watchlist");
  });

  it("reports which field matched", () => {
    const hits = fuzzySearch("watchlist", items, { fields });
    expect(hits[0].field).toBe("label");
  });

  it("applies the threshold", () => {
    const loose = fuzzySearch("top", items, { fields, threshold: 0 });
    const strict = fuzzySearch("top", items, { fields, threshold: 10_000 });
    expect(loose.length).toBeGreaterThan(0);
    expect(strict).toEqual([]);
  });

  it("applies the limit", () => {
    expect(fuzzySearch("a", items, { fields, limit: 2 })).toHaveLength(2);
  });

  it("lets a field weight outrank the stronger tier on another field", () => {
    // Both candidates contain "top", but for different reasons:
    //   "Top Notch"  -> label prefix   (tier 2, ~800)
    //   "Highest"    -> keyword "top rated" substring (tier 3, ~600)
    // Unweighted, the prefix wins. Weighting keywords 4x flips the order,
    // which is what lets a curated synonym beat a literal title match.
    const weighted = [
      { label: "Top Notch", path: "/tn", keywords: "" },
      { label: "Highest", path: "/hi", keywords: "top rated" },
    ];
    const shape = (i: (typeof weighted)[number]) => ({
      label: i.label,
      path: i.path,
      keywords: i.keywords,
    });

    expect(fuzzySearch("top", weighted, { fields: shape })[0].item.label).toBe("Top Notch");
    expect(
      fuzzySearch("top", weighted, {
        fields: shape,
        weights: { keywords: 4, label: 1, path: 0.2 },
      })[0].item.label
    ).toBe("Highest");
  });

  it("skips empty field values instead of failing", () => {
    const sparse = [{ label: "Ok", path: "", keywords: "" }];
    expect(() => fuzzySearch("ok", sparse, { fields: fields as never })).not.toThrow();
    expect(fuzzyScore("ok", "")).toBeNull();
  });

  it("is case insensitive", () => {
    const hits = fuzzySearch("WATCHLIST", items, { fields });
    expect(hits[0].item.label).toBe("Watchlist");
  });
});

describe("highlight", () => {
  it("flags matched and unmatched characters", () => {
    const out = highlight("search", [0, 1, 2]);
    expect(out).toEqual([
      { char: "s", match: true },
      { char: "e", match: true },
      { char: "a", match: true },
      { char: "r", match: false },
      { char: "c", match: false },
      { char: "h", match: false },
    ]);
  });

  it("handles an empty match set", () => {
    expect(highlight("abc", []).every((c) => !c.match)).toBe(true);
  });
});