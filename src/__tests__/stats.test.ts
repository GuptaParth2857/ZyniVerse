import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getUserStats } from "@/lib/stats";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockResolvedValue(fn: any, value: unknown) {
  fn.mockResolvedValue(value);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserStats", () => {
  it("returns default stats for empty user", async () => {
    mockResolvedValue(prisma.listEntry.findMany, []);
    mockResolvedValue(prisma.episodeProgress.findMany, []);

    const stats = await getUserStats("u1");
    expect(stats.totalAnime).toBe(0);
    expect(stats.totalEpisodes).toBe(0);
    expect(stats.meanScore).toBe(0);
    expect(stats.completedCount).toBe(0);
    expect(stats.droppedCount).toBe(0);
    expect(stats.planningCount).toBe(0);
    expect(stats.watchingCount).toBe(0);
    expect(Array.isArray(stats.genreBreakdown)).toBe(true);
    expect(Array.isArray(stats.formatBreakdown)).toBe(true);
    expect(Array.isArray(stats.yearlyActivity)).toBe(true);
    expect(Array.isArray(stats.topStudios)).toBe(true);
    expect(stats.dayOfWeek).toHaveLength(7);
    expect(stats.longestStreak).toBe(0);
    expect(stats.currentStreak).toBe(0);
  });

  it("calculates stats from entries", async () => {
    mockResolvedValue(prisma.listEntry.findMany, [
      { mediaId: 1, status: "COMPLETED", score: 8, progress: 24, completedAt: new Date("2026-01-15"), type: "ANIME" },
      { mediaId: 2, status: "CURRENT", score: null, progress: 12, type: "ANIME" },
      { mediaId: 3, status: "PLANNING", score: null, progress: 0, type: "ANIME" },
      { mediaId: 4, status: "DROPPED", score: 5, progress: 3, type: "ANIME" },
    ]);
    mockResolvedValue(prisma.episodeProgress.findMany, [
      { createdAt: new Date("2026-01-15") },
      { createdAt: new Date("2026-01-16") },
    ]);

    const stats = await getUserStats("u1");
    expect(stats.totalAnime).toBe(4);
    expect(stats.completedCount).toBe(1);
    expect(stats.droppedCount).toBe(1);
    expect(stats.planningCount).toBe(1);
    expect(stats.watchingCount).toBe(1);
    expect(stats.meanScore).toBe(6.5); // (8 + 5) / 2 = 6.5
  });
});
