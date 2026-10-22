import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The cron workflow used to route on the *wall-clock hour* of the run:
 *
 *   case "$HOUR" in
 *     03) [ "$DOW" = "0" ] && LIST="db-prune" ;;
 *
 * GitHub queues scheduled workflows during peak load and starts them late
 * (observed: a "0 3 * * 0" run starting at 12:55 UTC, a "0 9 * * *" run
 * starting at 14:17 UTC), so the hour never matched and every run resolved to
 * "<nothing>". The database was therefore never pruned and the monthly
 * analytics snapshot stopped on 2026-10-16.
 *
 * The workflow now routes on `github.event.schedule` — the cron expression
 * that triggered the run — which is delay-proof. These tests lock that in.
 */

const WORKFLOW = path.join(process.cwd(), ".github", "workflows", "cron.yml");
const raw = fs.readFileSync(WORKFLOW, "utf8");

/** All `- cron: "..."` entries of the schedule block. */
const schedules = [...raw.matchAll(/^\s*-\s*cron:\s*"([^"]+)"/gm)].map((m) => m[1]);

/** The schedule-string -> endpoint mapping of the "due" step. */
const mapping = new Map(
  [...raw.matchAll(/"([^"]+)"\)\s*LIST="([^"]+)"/g)].map((m) => [m[1], m[2]])
);

describe("cron workflow routing", () => {
  it("declares the eight expected schedules", () => {
    expect(schedules).toHaveLength(8);
    expect(schedules).toEqual([
      "0 9 * * *",
      "0 3 * * 0",
      "0 5 * * 1",
      "0 8 * * 1",
      "0 0 1 * *",
      "0 2 1 * *",
      "0 4 1 * *",
      "0 6 1 * *",
    ]);
  });

  it("maps every declared schedule to an endpoint", () => {
    for (const schedule of schedules) {
      expect(mapping.has(schedule), `no endpoint mapped for schedule "${schedule}"`).toBe(true);
    }
  });

  it("maps the schedules to the expected endpoints", () => {
    expect(mapping.get("0 9 * * *")).toBe("character-tournaments");
    expect(mapping.get("0 3 * * 0")).toBe("db-prune");
    expect(mapping.get("0 5 * * 1")).toBe("event-alerts");
    expect(mapping.get("0 8 * * 1")).toBe("indexnow");
    expect(mapping.get("0 0 1 * *")).toBe("refresh-schedules");
    expect(mapping.get("0 2 1 * *")).toBe("refresh-awards");
    expect(mapping.get("0 4 1 * *")).toBe("refresh-posters");
    expect(mapping.get("0 6 1 * *")).toBe("analytics");
  });

  it("routes on github.event.schedule, not on the wall-clock hour", () => {
    expect(raw).toContain("${{ github.event.schedule }}");
    // The hour-based routing survives only as the manual-dispatch fallback.
    const hourCases = raw.match(/case "\$HOUR" in/g) ?? [];
    expect(hourCases).toHaveLength(1);
    expect(raw).toContain('if [ "$LIST" = "__manual__" ]');
  });

  it("only calls endpoints that exist as cron routes", () => {
    const cronDir = path.join(process.cwd(), "src", "app", "api", "cron");
    const available = new Set(fs.readdirSync(cronDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name));

    for (const endpoint of mapping.values()) {
      expect(available.has(endpoint), `unknown cron endpoint "${endpoint}"`).toBe(true);
    }
  });

  it("keeps the manual dispatch override", () => {
    expect(raw).toContain("${{ inputs.endpoint }}");
    expect(raw).toContain('if [ -n "${MANUAL:-}" ]');
  });
});
