import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  markEpisodeWatched,
  markEpisodeUnwatched,
  getEpisodeProgress,
  getWatchStreak,
  autoUpdateListEntry,
} from "@/lib/episode-tracking";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockResolvedValue(fn: any, value: unknown) {
  fn.mockResolvedValue(value);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("markEpisodeWatched", () => {
  it("upserts episode progress", async () => {
    mockResolvedValue(prisma.episodeProgress.upsert, { userId: "u1", mediaId: 1, episode: 5 });
    await markEpisodeWatched("u1", 1, 5, "Episode 5");
    expect(prisma.episodeProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_mediaId_episode: { userId: "u1", mediaId: 1, episode: 5 } },
      })
    );
  });
});

describe("markEpisodeUnwatched", () => {
  it("deletes the episode progress record", async () => {
    await markEpisodeUnwatched("u1", 1, 5);
    expect(prisma.episodeProgress.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", mediaId: 1, episode: 5 },
    });
  });
});

describe("getEpisodeProgress", () => {
  it("returns watched episodes and total", async () => {
    mockResolvedValue(prisma.episodeProgress.findMany, [
      { episode: 1 }, { episode: 2 }, { episode: 3 },
    ]);
    mockResolvedValue(prisma.listEntry.findUnique, { total: 24 });

    const result = await getEpisodeProgress("u1", 1);
    expect(result.watched).toEqual([1, 2, 3]);
    expect(result.total).toBe(24);
  });

  it("returns 0 total when no list entry", async () => {
    mockResolvedValue(prisma.episodeProgress.findMany, []);
    mockResolvedValue(prisma.listEntry.findUnique, null);

    const result = await getEpisodeProgress("u1", 1);
    expect(result.watched).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getWatchStreak", () => {
  it("returns zeros for no activity", async () => {
    mockResolvedValue(prisma.episodeProgress.findMany, []);
    const result = await getWatchStreak("u1");
    expect(result).toEqual({ current: 0, longest: 0 });
  });

  it("calculates streak from sequential dates", async () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 86400000);
    mockResolvedValue(prisma.episodeProgress.findMany, [
      { watchedAt: today },
      { watchedAt: yesterday },
      { watchedAt: twoDaysAgo },
    ]);
    const result = await getWatchStreak("u1");
    expect(result.current).toBeGreaterThanOrEqual(1);
    expect(result.longest).toBeGreaterThanOrEqual(1);
  });
});

describe("autoUpdateListEntry", () => {
  it("does nothing when no progress and no existing entry", async () => {
    mockResolvedValue(prisma.episodeProgress.count, 0);
    mockResolvedValue(prisma.listEntry.findUnique, null);
    await autoUpdateListEntry("u1", 1, 24);
    expect(prisma.listEntry.upsert).not.toHaveBeenCalled();
    expect(prisma.listEntry.create).not.toHaveBeenCalled();
  });

  it("marks as COMPLETED when all episodes watched", async () => {
    mockResolvedValue(prisma.episodeProgress.count, 24);
    mockResolvedValue(prisma.listEntry.findUnique, null);
    await autoUpdateListEntry("u1", 1, 24);
    expect(prisma.listEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: "COMPLETED", progress: 24, total: 24 }),
      })
    );
  });
});
