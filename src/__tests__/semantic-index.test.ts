/**
 * Guards the hrefs that the semantic index hands to the UI.
 *
 * These were wrong once already: the index pointed at
 * `/forum/thread/${slug}` while every other link in the codebase points at
 * `/forum/thread/${id}`. A dead href in a search result is worse than no
 * result - it looks like the document exists and simply refuses to open - and no
 * unit test on vector maths would ever have caught it.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { getMediaBatch } from "@/lib/anilist";
import { isSource, SOURCES, SOURCE_LABEL, sourceDocuments } from "@/lib/semantic-index";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    wikiPage: { findMany: vi.fn() },
    blogPost: { findMany: vi.fn() },
    forumThread: { findMany: vi.fn() },
    review: { findMany: vi.fn() },
    communityTag: { findMany: vi.fn() },
    sceneClip: { findMany: vi.fn() },
    moment: { findMany: vi.fn() },
    externalAward: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/anilist", () => ({
  bestTitle: (t: { english?: string | null; romaji?: string | null; native?: string | null; userPreferred?: string | null } | null) =>
    t?.userPreferred || t?.english || t?.romaji || t?.native || "",
  getMediaBatch: vi.fn(),
}));

const mocked = prisma as unknown as {
  wikiPage: { findMany: ReturnType<typeof vi.fn> };
  blogPost: { findMany: ReturnType<typeof vi.fn> };
  forumThread: { findMany: ReturnType<typeof vi.fn> };
  review: { findMany: ReturnType<typeof vi.fn> };
  communityTag: { findMany: ReturnType<typeof vi.fn> };
  sceneClip: { findMany: ReturnType<typeof vi.fn> };
  moment: { findMany: ReturnType<typeof vi.fn> };
  externalAward: { findMany: ReturnType<typeof vi.fn> };
};

const mediaBatch = vi.mocked(getMediaBatch);

/** AniList always returns the whole basic shape; only `id` and `title` matter here. */
const media = (id: number, userPreferred: string, extra: Record<string, string> = {}) => ({
  id,
  title: { userPreferred, ...extra },
  coverImage: {},
});

describe("semantic index hrefs", () => {
  it("points wiki entries at /wiki/<slug>", async () => {
    mocked.wikiPage.findMany.mockResolvedValue([
      { slug: "isekai", title: "Isekai", content: "c", summary: null, tags: "genre" },
    ]);
    const [doc] = await sourceDocuments("wiki");
    expect(doc.href).toBe("/wiki/isekai");
  });

  it("points blog entries at /blog/<slug>", async () => {
    mocked.blogPost.findMany.mockResolvedValue([
      { slug: "my-post", title: "My Post", content: "c", excerpt: null, tags: "" },
    ]);
    const [doc] = await sourceDocuments("blog");
    expect(doc.href).toBe("/blog/my-post");
  });

  it("points forum entries at the primary key, not the slug", async () => {
    mocked.forumThread.findMany.mockResolvedValue([
      { id: "clx123", slug: "battles-mrnh7knn", title: "Battles", content: "c" },
    ]);
    const [doc] = await sourceDocuments("forum");
    // Regression guard: /forum/thread/[id] is what Navbar, ForumThreadCard,
    // ForumSidebar and CommandPalette all link to.
    expect(doc.href).toBe("/forum/thread/clx123");
    expect(doc.href).not.toBe("/forum/thread/battles-mrnh7knn");
  });

  it("keeps the slug as the cache identity so keys stay readable", async () => {
    mocked.forumThread.findMany.mockResolvedValue([
      { id: "clx123", slug: "battles-mrnh7knn", title: "Battles", content: "c" },
    ]);
    const [doc] = await sourceDocuments("forum");
    expect(doc.id).toBe("battles-mrnh7knn");
  });

  it("asks for the primary key, without which the href cannot be built", async () => {
    mocked.forumThread.findMany.mockResolvedValue([]);
    await sourceDocuments("forum");
    const select = mocked.forumThread.findMany.mock.calls[0][0].select;
    expect(select).toHaveProperty("id");
  });
});

/**
 * The corpus was 28 documents - the whole of the site's editorial content - which
 * is why almost any question came back with nothing. These cover the structured
 * sources added on top, and the two things that quietly break them: hrefs that
 * point at routes which do not exist, and title lookups that fan out into one
 * AniList request per row.
 */
describe("isSource", () => {
  it("accepts every source the index can return", () => {
    // Regression guard: the guard used to spell out wiki/blog/forum while the
    // index listed eight sources, so `?sources=award` was rejected as invalid
    // even though awards were indexed and shown.
    for (const s of SOURCES) {
      expect(isSource(s), `${s} must be a valid ?sources= value`).toBe(true);
    }
  });

  it("rejects anything not in the index", () => {
    expect(isSource("nonsense")).toBe(false);
    expect(isSource("")).toBe(false);
    expect(isSource(null)).toBe(false);
  });

  it("does not accept a near-miss, so a typo fails loudly", () => {
    expect(isSource("Wiki")).toBe(false);
    expect(isSource("wikis")).toBe(false);
  });
});

describe("structured sources", () => {
  // Deliberately NOT reset between tests. The point is that no two tests ever
  // share an id, so resetting the counter back to the same starting value would
  // reintroduce exactly the collision this avoids.
  let nextMediaId = 900_000;
  const mediaId = () => nextMediaId++;

  beforeEach(() => {
    mediaBatch.mockReset();
  });

  it("has a label for every source, so the filter row cannot miss one", () => {
    for (const s of SOURCES) {
      expect(SOURCE_LABEL[s], `missing label for ${s}`).toBeTruthy();
    }
    // Derived from the same list, so this cannot drift from it.
    expect(Object.keys(SOURCE_LABEL).sort()).toEqual([...SOURCES].sort());
  });

  it("builds review documents against the media title", async () => {
    const id = mediaId();
    mediaBatch.mockResolvedValue([media(id, "One Piece")]);
    mocked.review.findMany.mockResolvedValue([
      { id: "r1", mediaId: id, rating: 9, comment: "Still holds up." },
    ]);
    const [doc] = await sourceDocuments("review");
    expect(doc.title).toContain("One Piece");
    expect(doc.href).toBe(`/anime/${id}`);
    // The rating and the prose both have to reach the embedder, not just the title.
    expect(doc.body).toContain("9 out of 10");
    expect(doc.body).toContain("Still holds up.");
  });

  it("prefers the userPreferred title over romaji", async () => {
    const id = mediaId();
    mediaBatch.mockResolvedValue([media(id, "OP", { romaji: "ONE PIECE", english: "One Piece" })]);
    mocked.review.findMany.mockResolvedValue([{ id: "r1", mediaId: id, rating: 8, comment: "ok" }]);
    const [doc] = await sourceDocuments("review");
    expect(doc.title).toBe("Review of OP");
  });

  it("degrades to a visible id when the title lookup fails, rather than dropping the row", async () => {
    const id = mediaId();
    mediaBatch.mockRejectedValue(new Error("AniList down"));
    mocked.review.findMany.mockResolvedValue([
      { id: "r1", mediaId: id, rating: 9, comment: "Still holds up." },
    ]);
    const docs = await sourceDocuments("review");
    // A result with an ugly title is recoverable; a silently missing row is not.
    expect(docs).toHaveLength(1);
    expect(docs[0].title).toContain(`#${id}`);
    expect(docs[0].body).toContain("Still holds up.");
  });

  it("batches title lookups instead of asking once per row", async () => {
    const id = mediaId();
    mediaBatch.mockResolvedValue([media(id, "One Piece")]);
    mocked.communityTag.findMany.mockResolvedValue([
      { id: "t1", mediaId: id, tag: "masterpiece", score: 11 },
      { id: "t2", mediaId: id, tag: "long-running", score: 7 },
      { id: "t3", mediaId: id, tag: "slow burn", score: 3 },
    ]);
    await sourceDocuments("tags");
    // One request for three rows. At 30 requests/minute AniList's budget, a
    // per-row lookup would spend 84 of 84 on titles and starve every other route.
    expect(mediaBatch).toHaveBeenCalledTimes(1);
    expect(mediaBatch.mock.calls[0][0]).toEqual([id]);
  });

  it("reuses one lookup for repeated media ids", async () => {
    const a = mediaId();
    const b = mediaId();
    mediaBatch.mockImplementation(async (ids: number[]) =>
      ids.map((id) => media(id, `Anime ${id}`))
    );
    mocked.communityTag.findMany.mockResolvedValue([
      { id: "t1", mediaId: a, tag: "x", score: 1 },
      { id: "t2", mediaId: b, tag: "y", score: 1 },
      { id: "t3", mediaId: a, tag: "z", score: 1 },
    ]);
    const docs = await sourceDocuments("tags");
    // Two distinct ids in one request, not three.
    expect(mediaBatch.mock.calls[0][0]).toEqual([a, b]);
    expect(docs).toHaveLength(3);
  });

  it("chunks title lookups past the 50-row batch cap", async () => {
    const rows = Array.from({ length: 120 }, (_, i) => ({
      id: `t${i}`,
      mediaId: mediaId(),
      tag: "x",
      score: 1,
    }));
    mocked.communityTag.findMany.mockResolvedValue(rows);
    mediaBatch.mockImplementation(async (ids: number[]) =>
      ids.map((id) => media(id, `Anime ${id}`))
    );
    const docs = await sourceDocuments("tags");
    expect(docs).toHaveLength(120);
    // getMediaBatch caps at perPage 50, so 120 ids must be 3 requests - not one
    // request that silently returns only the first 50 titles.
    expect(mediaBatch.mock.calls.map((c) => c[0].length)).toEqual([50, 50, 20]);
    expect(docs[119].title).toContain(String(rows[119].mediaId));
  });

  it("describes a community tag as a sentence, not a bare field", async () => {
    const id = mediaId();
    mediaBatch.mockResolvedValue([media(id, "One Piece")]);
    mocked.communityTag.findMany.mockResolvedValue([
      { id: "t1", mediaId: id, tag: "masterpiece", score: 11 },
    ]);
    const [doc] = await sourceDocuments("tags");
    // The embedder sees prose. "long-running" against a media id carries no more
    // meaning than `tag:long-running` against `mediaId:21` would.
    expect(doc.body).toContain("One Piece");
    expect(doc.body).toContain("masterpiece");
    expect(doc.tags).toBe("masterpiece");
  });

  it("links clips to the gallery, because there is no /clips/[id] route", async () => {
    mocked.sceneClip.findMany.mockResolvedValue([
      { id: "c1", title: "Zoro vs Sanji", description: "The WSS fight.", mediaTitle: "One Piece", tags: "fight" },
    ]);
    const [doc] = await sourceDocuments("clip");
    // Regression guard: only /clips and /clips/upload exist as routes.
    expect(doc.href).toBe("/clips");
  });

  it("links moments to their detail page", async () => {
    mocked.moment.findMany.mockResolvedValue([
      { id: "m1", animeTitle: "Naruto", quote: "Believe it!", character: "Naruto" },
    ]);
    const [doc] = await sourceDocuments("moment");
    expect(doc.href).toBe("/moments/m1");
  });

  it("links an award to the year page that exists", async () => {
    mocked.externalAward.findMany.mockResolvedValue([
      { id: "a1", year: 2024, category: "Anime of the Year", winner: "Frieren", platform: "Crunchyroll" },
    ]);
    const [doc] = await sourceDocuments("award");
    // /awards/[year] exists; /awards#2024 would have been a bare anchor guess.
    expect(doc.href).toBe("/awards/2024");
  });

  it("excludes unapproved tags, so the index cannot be written by anyone", async () => {
    mocked.communityTag.findMany.mockResolvedValue([]);
    await sourceDocuments("tags");
    expect(mocked.communityTag.findMany.mock.calls[0][0].where).toEqual({ isApproved: true });
  });

  it("excludes private moments", async () => {
    mocked.moment.findMany.mockResolvedValue([]);
    await sourceDocuments("moment");
    expect(mocked.moment.findMany.mock.calls[0][0].where).toEqual({ isPublic: true });
  });
});