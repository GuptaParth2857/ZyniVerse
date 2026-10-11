/**
 * Guards AI Concierge v2: the memory AROUND the model call.
 *
 * The model itself is mocked. What is worth locking down is the glue: history is
 * replayed in a valid order, taste reaches the system prompt, a hallucinated
 * href can never be returned, a failed generation does not get remembered, and
 * the stored thread stays bounded.
 */
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { prisma } from "@/lib/prisma";
import { geminiGenerate } from "@/lib/gemini";
import { getDnaForUser } from "@/lib/dna";
import {
  allowedCommands,
  askConcierge,
  buildTasteContext,
  clearConversation,
  getConversation,
  toModelTurns,
  type ConciergeTurn,
} from "@/lib/concierge";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    aiConversation: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    aiMessage: { create: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/gemini", async () => {
  const actual = await vi.importActual<typeof import("@/lib/gemini")>("@/lib/gemini");
  return { ...actual, geminiGenerate: vi.fn() };
});

vi.mock("@/lib/dna", () => ({ getDnaForUser: vi.fn() }));

vi.mock("@/lib/commands", () => ({
  commandsFor: vi.fn(() => [
    { id: "search", label: "Search", path: "/search", group: "Anime", keywords: "find lookup" },
    { id: "profile", label: "Profile", path: "/profile", group: "Account" },
  ]),
}));

const db = () =>
  prisma as unknown as {
    aiConversation: { findUnique: Mock; upsert: Mock; deleteMany: Mock };
    aiMessage: { create: Mock; findMany: Mock; deleteMany: Mock };
    $transaction: Mock;
  };

const DNA = {
  totalAnime: 42,
  topGenres: [{ genre: "Shounen", count: 9, pct: 40 }],
  archetype: { label: "The Binge Lord" },
  watchStyle: { label: "Marathoner" },
  favoriteStudio: "MAPPA",
};

beforeEach(() => {
  vi.clearAllMocks();
  db().aiConversation.findUnique.mockResolvedValue(null);
  db().aiConversation.upsert.mockResolvedValue({ id: "c1" });
  db().aiMessage.create.mockResolvedValue({ id: "m1" });
  db().aiMessage.findMany.mockResolvedValue([]);
  db().$transaction.mockResolvedValue([]);
  vi.mocked(getDnaForUser).mockResolvedValue(DNA as Awaited<ReturnType<typeof getDnaForUser>>);
});

describe("allowedCommands", () => {
  it("projects the registry to path/label/keywords", () => {
    expect(allowedCommands()).toEqual([
      { path: "/search", label: "Search", keywords: "find lookup" },
      { path: "/profile", label: "Profile", keywords: undefined },
    ]);
  });
});

describe("toModelTurns", () => {
  it("drops leading model turns so the replay starts with the user", () => {
    const history: ConciergeTurn[] = [
      { role: "model", text: "stale", href: null, createdAt: new Date() },
      { role: "user", text: "hi", href: null, createdAt: new Date() },
      { role: "model", text: "hey", href: null, createdAt: new Date() },
    ];
    expect(toModelTurns(history)).toEqual([
      { role: "user", text: "hi" },
      { role: "model", text: "hey" },
    ]);
  });
});

describe("buildTasteContext", () => {
  it("summarises the DNA profile", async () => {
    const ctx = await buildTasteContext("u1", "parth");
    expect(ctx).toContain("42 anime tracked");
    expect(ctx).toContain("top genres: Shounen");
    expect(ctx).toContain("MAPPA");
  });

  it("degrades to an empty context when DNA aggregation fails", async () => {
    vi.mocked(getDnaForUser).mockRejectedValue(new Error("anilist down"));
    expect(await buildTasteContext("u1", "parth")).toBe("");
  });
});

describe("askConcierge", () => {
  it("returns a validated navigation target and remembers the turn", async () => {
    vi.mocked(geminiGenerate).mockResolvedValue(JSON.stringify({ href: "/search" }));

    const reply = await askConcierge({ userId: "u1", username: "parth", query: "take me to search" });

    expect(reply).toEqual({ href: "/search", label: "Search" });
    expect(db().aiConversation.upsert).toHaveBeenCalledWith({ where: { userId: "u1" }, update: {}, create: { userId: "u1" } });
    expect(db().aiMessage.create).toHaveBeenCalledTimes(2);
    const [userMsg, modelMsg] = db().aiMessage.create.mock.calls.map(([arg]) => arg.data);
    expect(userMsg).toMatchObject({ role: "user", text: "take me to search" });
    expect(modelMsg).toMatchObject({ role: "model", href: "/search" });
    // Explicitly ordered: same-transaction inserts would otherwise share `now()`.
    expect(userMsg.createdAt.getTime()).toBeLessThan(modelMsg.createdAt.getTime());
  });

  it("never returns a hallucinated href and falls back to the answer", async () => {
    vi.mocked(geminiGenerate).mockResolvedValue(JSON.stringify({ href: "/admin/secret", answer: "Try the search page." }));

    const reply = await askConcierge({ userId: "u1", username: "parth", query: "where is the admin panel" });

    expect(reply).toEqual({ answer: "Try the search page." });
  });

  it("throws when the reply is neither a valid page nor an answer (and remembers nothing)", async () => {
    vi.mocked(geminiGenerate).mockResolvedValue(JSON.stringify({ href: "/nope" }));

    await expect(askConcierge({ userId: "u1", username: "parth", query: "do a thing" })).rejects.toThrow();
    expect(db().aiMessage.create).not.toHaveBeenCalled();
  });

  it("replays history as turns and folds taste into the system prompt", async () => {
    db().aiConversation.findUnique.mockResolvedValue({
      id: "c1",
      messages: [
        { role: "model", text: "Which one?", href: null, createdAt: new Date(2) },
        { role: "user", text: "the first", href: null, createdAt: new Date(1) },
      ],
    });
    vi.mocked(geminiGenerate).mockResolvedValue(JSON.stringify({ answer: "That's Food Wars." }));

    await askConcierge({ userId: "u1", username: "parth", query: "what about that one" });

    const arg = vi.mocked(geminiGenerate).mock.calls[0][0];
    expect(arg.turns).toEqual([
      { role: "user", text: "the first" },
      { role: "model", text: "Which one?" },
    ]);
    expect(arg.system).toContain("top genres: Shounen");
    // Personalized replies are never cached.
    expect(arg.cacheKey).toBeUndefined();
  });

  it("prunes the thread beyond the stored cap", async () => {
    vi.mocked(geminiGenerate).mockResolvedValue(JSON.stringify({ answer: "ok" }));
    db().aiMessage.findMany.mockResolvedValue([{ id: "old1" }, { id: "old2" }]);

    await askConcierge({ userId: "u1", username: "parth", query: "hello there" });

    expect(db().aiMessage.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ["old1", "old2"] } } });
  });
});

describe("getConversation / clearConversation", () => {
  it("returns the stored turns oldest-first", async () => {
    db().aiConversation.findUnique.mockResolvedValue({
      id: "c1",
      messages: [
        { role: "model", text: "second", href: "/search", createdAt: new Date(2) },
        { role: "user", text: "first", href: null, createdAt: new Date(1) },
      ],
    });

    const convo = await getConversation("u1");

    expect(convo.map((m) => m.text)).toEqual(["first", "second"]);
    expect(convo[1].role).toBe("model");
    expect(convo[1].href).toBe("/search");
  });

  it("returns an empty list when there is no conversation", async () => {
    db().aiConversation.findUnique.mockResolvedValue(null);
    expect(await getConversation("u1")).toEqual([]);
  });

  it("clears the whole conversation", async () => {
    await clearConversation("u1");
    expect(db().aiConversation.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
  });
});
