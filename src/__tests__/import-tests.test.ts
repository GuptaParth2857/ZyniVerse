import { describe, it, expect } from "vitest";
import { parseMALXml, MAL_STATUS_MAP } from "@/lib/mal-xml";
import { parseAge, normalizeGender } from "@/lib/character-traits";

describe("parseMALXml", () => {
  it("parses a valid MAL XML export", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <myanimelist>
        <myinfo>...</myinfo>
        <anime>
          <series_animedb_id>5114</series_animedb_id>
          <my_status>completed</my_status>
          <my_watched_episodes>25</my_watched_episodes>
          <my_score>10</my_score>
          <my_start_date>2009-06-01</my_start_date>
          <my_finish_date>2009-06-15</my_finish_date>
        </anime>
        <anime>
          <series_animedb_id>1</series_animedb_id>
          <my_status>watching</my_status>
          <my_watched_episodes>5</my_watched_episodes>
          <my_score>0</my_score>
        </anime>
      </myanimelist>`;
    const results = parseMALXml(xml);
    expect(results).toHaveLength(2);

    const first = results[0];
    expect(first.animeId).toBe(5114);
    expect(first.status).toBe("COMPLETED");
    expect(first.episodesWatched).toBe(25);
    expect(first.score).toBe(10);
    expect(first.startDate).toBe("2009-06-01");
    expect(first.endDate).toBe("2009-06-15");

    const second = results[1];
    expect(second.status).toBe("CURRENT");
    expect(second.score).toBe(0);
  });

  it("maps statuses via MAL_STATUS_MAP", () => {
    expect(MAL_STATUS_MAP["plan to watch"]).toBe("PLANNING");
    expect(MAL_STATUS_MAP["on-hold"]).toBe("PAUSED");
    expect(MAL_STATUS_MAP["rewatching"]).toBe("REWATCHING");
  });

  it("handles an empty input", () => {
    expect(parseMALXml("")).toEqual([]);
  });

  it("skips entries with no animedb id", () => {
    const xml = `<myanimelist><anime><my_status>Completed</my_status><my_watched_episodes>1</my_watched_episodes></anime></myanimelist>`;
    expect(parseMALXml(xml)).toEqual([]);
  });
});

describe("parseAge", () => {
  it("parses a plain integer age", () => {
    expect(parseAge("17")).toEqual({ ageInt: 17, ageLabel: "17" });
  });

  it("parses a numeric age", () => {
    expect(parseAge(14)).toEqual({ ageInt: 14, ageLabel: "14" });
  });

  it("parses a range age using the lower bound", () => {
    expect(parseAge("25-30")).toEqual({ ageInt: 25, ageLabel: "25-30" });
  });

  it("returns nulls for unknown/hyphen strings", () => {
    expect(parseAge("Unknown")).toEqual({ ageInt: null, ageLabel: null });
    expect(parseAge("$")).toEqual({ ageInt: null, ageLabel: "$" });
    expect(parseAge(null)).toEqual({ ageInt: null, ageLabel: null });
  });
});

describe("normalizeGender", () => {
  it("normalizes male/female", () => {
    expect(normalizeGender("Female")).toBe("Female");
    expect(normalizeGender("Male")).toBe("Male");
    expect(normalizeGender("male")).toBe("Male");
  });

  it("normalizes non-binary", () => {
    expect(normalizeGender("Non-binary")).toBe("Non-binary");
    expect(normalizeGender("nonbinary")).toBe("Non-binary");
  });

  it("returns null for empty", () => {
    expect(normalizeGender(null)).toBeNull();
    expect(normalizeGender("")).toBeNull();
  });
});