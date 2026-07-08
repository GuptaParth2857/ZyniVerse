import { vi, beforeEach } from "vitest";

vi.stubGlobal("fetch", vi.fn());
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
    themeSong: { findMany: vi.fn(), findFirst: vi.fn() },
    watchParty: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
    episodeProgress: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    listEntry: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    review: {
      findMany: vi.fn(),
    },
    activity: {
      findMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(fetch).mockReset();
  vi.clearAllTimers();
});
