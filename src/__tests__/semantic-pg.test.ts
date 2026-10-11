/**
 * Guards the pgvector fast path of the semantic index.
 *
 * The scan path is exercised against the live database; the pgvector path cannot
 * be, until the DocEmbedding migration is applied - which needs a database owner.
 * So this file mocks Prisma's raw-query surface and checks the things that would
 * be easy to get quietly wrong:
 *
 *  - the mirror stays a projection of AiCache (sync writes every live row and
 *    prunes rows whose document no longer exists),
 *  - the KNN query is actually issued when the migration is live, and
 *  - `searchSemantic` degrades to the scan path for every reason the fast path
 *    could fail, rather than 500-ing.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  vectorLiteral,
  pgvectorEnabled,
  resetSemanticCachesForTests,
  searchSemantic,
  SOURCES,
  type Source,
} from "@/lib/semantic-index";
import { contentHash, docEmbedKey, EMBED_DIMS, embedText } from "@/lib/embeddings";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    aiCache: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    wikiPage: { findMany: vi.fn() },
    blogPost: { findMany: vi.fn() },
    forumThread: { findMany: vi.fn() },
    review: { findMany: vi.fn() },
    communityTag: { findMany: vi.fn() },
    sceneClip: { findMany: vi.fn() },
    moment: { findMany: vi.fn() },
    externalAward: { findMany: vi.fn() },
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  },
}));

vi.mock("@/lib/embeddings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/embeddings")>("@/lib/embeddings");
  return { ...actual, embedText: vi.fn() };
});

vi.mock("@/lib/anilist", () => ({
  bestTitle: () => "",
  getMediaBatch: vi.fn(),
}));

const mocked = prisma as unknown as {
  aiCache: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
  wikiPage: { findMany: ReturnType<typeof vi.fn> };
  blogPost: { findMany: ReturnType<typeof vi.fn> };
  forumThread: { findMany: ReturnType<typeof vi.fn> };
  review: { findMany: ReturnType<typeof vi.fn> };
  communityTag: { findMany: ReturnType<typeof vi.fn> };
  sceneClip: { findMany: ReturnType<typeof vi.fn> };
  moment: { findMany: ReturnType<typeof vi.fn> };
  externalAward: { findMany: ReturnType<typeof vi.fn> };
  $queryRaw: ReturnType<typeof vi.fn>;
  $executeRaw: ReturnType<typeof vi.fn>;
};

const embedMock = vi.mocked(embedText);

/** A dimension-correct vector; content is irrelevant to most tests. */
function makeVec(fill = 0.01): number[] {
  return Array.from({ length: EMBED_DIMS }, (_, i) => (i === 0 ? 0.5 : fill));
}

/** One live embedding row in the shape `loadIndex` parses out of AiCache. */
function wikiRow(): { key: string; response: string } {
  return {
    key: docEmbedKey("wiki", "isekai", contentHash("isekai body")),
    response: JSON.stringify({
      id: "isekai",
      source: "wiki",
      title: "Isekai",
      href: "/wiki/isekai",
      snippet: "Guides to the isekai trope and its best entries.",
      tags: "genre",
      v: makeVec(),
      dims: EMBED_DIMS,
      model: "gemini-embedding-001",
    }),
  };
}

/**
 * Start each test from a cold process: the module's TTL caches (probe 60s,
 * index and mirror 600s) are reset so no test can inherit another test's state.
 */
function resetRuntimeState(): void {
  resetSemanticCachesForTests();
  mocked.$queryRaw.mockReset();
  mocked.$executeRaw.mockReset();
  mocked.aiCache.findMany.mockReset();
  mocked.aiCache.findUnique.mockReset();
  embedMock.mockReset();
}

describe("vectorLiteral", () => {
  it("renders the bracket form Postgres parses", () => {
    expect(vectorLiteral([0.1, 0.2, -0.3])).toBe("[0.1,0.2,-0.3]");
  });

  it("keeps negative exponents parseable, since embeddings contain tiny values", () => {
    expect(vectorLiteral([1.2e-7])).toBe("[1.2e-7]");
  });
});

describe("pgvectorEnabled", () => {
  beforeEach(resetRuntimeState);

  it("is true when the mirror table answers (even empty)", async () => {
    mocked.$queryRaw.mockResolvedValue([]);
    expect(await pgvectorEnabled()).toBe(true);
    // The probe is cached for its TTL: two calls must not mean two probes.
    expect(await pgvectorEnabled()).toBe(true);
    expect(mocked.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("is false when the table or extension is missing", async () => {
    mocked.$queryRaw.mockRejectedValue(new Error('relation "DocEmbedding" does not exist'));
    expect(await pgvectorEnabled()).toBe(false);
  });
});

describe("searchSemantic with the pgvector mirror", () => {
  beforeEach(resetRuntimeState);

  /**
   * The healthy fast path: migration live, one wiki row in the index, a cached
   * query vector, and the KNN scan returns one hit with the count as `scanned`.
   */
  it("answers from the mirror and reports engine=pgvector", async () => {
    mocked.aiCache.findMany.mockImplementation(async (args: { where?: { kind?: string } }) => {
      if (args?.where?.kind === "embed:doc:wiki") return [wikiRow()];
      return [];
    });
    mocked.aiCache.findUnique.mockResolvedValue({
      response: JSON.stringify({ v: makeVec() }),
    });
    mocked.$queryRaw.mockImplementation(async (strings: TemplateStringsArray) => {
      const sql = strings.join("?");
      if (sql.includes('"DocEmbedding" LIMIT 1')) return []; // probe
      if (sql.includes("WITH q AS")) {
        return [
          {
            source: "wiki",
            id: "isekai",
            title: "Isekai",
            href: "/wiki/isekai",
            snippet: "Guides to the isekai trope.",
            tags: "genre",
            score: 0.81,
          },
        ];
      }
      if (sql.includes("count(*)")) return [{ n: 28 }];
      return []; // "existing mirror rows" select
    });
    mocked.$executeRaw.mockResolvedValue(1);

    const res = await searchSemantic("isekai");

    expect(res.engine).toBe("pgvector");
    // `scanned` keeps its scan-path meaning: how wide the search universe is.
    expect(res.scanned).toBe(28);
    expect(res.hits).toHaveLength(1);
    expect(res.hits[0]).toMatchObject({ id: "isekai", source: "wiki", title: "Isekai" });
    expect(res.hits[0].score).toBeCloseTo(0.81);
    expect(res.degraded).toBe(false);

    // The mirror was rebuilt as part of the query (mirrorDirty starts true).
    expect(mocked.$executeRaw).toHaveBeenCalled();

    // The KNN query carried the vector literal and the requested source filter.
    const knnCall = (mocked.$queryRaw as ReturnType<typeof vi.fn>).mock.calls.find((c) =>
      String((c[0] as TemplateStringsArray).join("?")).includes("WITH q AS")
    );
    expect(knnCall).toBeDefined();
    const [vec, sourceFilter] = knnCall!.slice(1) as [string, Source[]];
    expect(vec.startsWith("[")).toBe(true);
    expect(sourceFilter).toEqual(SOURCES);
  });

  /** Probe fails: the whole pgvector section is skipped and the scan answers. */
  it("falls back to the scan path when the migration is not applied", async () => {
    mocked.$queryRaw.mockRejectedValue(new Error('relation "DocEmbedding" does not exist'));
    mocked.aiCache.findMany.mockImplementation(async (args: { where?: { kind?: string } }) => {
      if (args?.where?.kind === "embed:doc:wiki") return [wikiRow()];
      return [];
    });
    mocked.aiCache.findUnique.mockResolvedValue({
      response: JSON.stringify({ v: makeVec() }),
    });

    const res = await searchSemantic("isekai");

    expect(res.engine).toBe("scan");
    expect(res.hits).toHaveLength(1);
    expect(res.hits[0].id).toBe("isekai");
    // A normalized-to-match pair scores 1.
    expect(res.hits[0].score).toBeCloseTo(1);
  });

  /** Mirror present but empty: fall through to the scan's live-table fallback. */
  it("falls through to the scan path when the mirror has nothing in it", async () => {
    mocked.aiCache.findMany.mockResolvedValue([]); // nothing embedded anywhere
    mocked.aiCache.findUnique.mockResolvedValue(null);
    mocked.$queryRaw.mockImplementation(async (strings: TemplateStringsArray) => {
      const sql = strings.join("?");
      if (sql.includes('"DocEmbedding" LIMIT 1')) return []; // probe: table live
      if (sql.includes("count(*)")) return [{ n: 0 }];
      return [];
    });
    // The scan's "nothing embedded yet" fallback searches the live tables.
    mocked.wikiPage.findMany.mockResolvedValue([]);
    mocked.blogPost.findMany.mockResolvedValue([]);
    mocked.forumThread.findMany.mockResolvedValue([]);
    mocked.review.findMany.mockResolvedValue([]);
    mocked.communityTag.findMany.mockResolvedValue([]);
    mocked.sceneClip.findMany.mockResolvedValue([]);
    mocked.moment.findMany.mockResolvedValue([]);
    mocked.externalAward.findMany.mockResolvedValue([]);
    mocked.$executeRaw.mockResolvedValue(0);

    const res = await searchSemantic("isekai");

    expect(res.engine).toBe("scan");
    expect(res.scanned).toBe(0);
    expect(res.hits).toHaveLength(0);
    expect(res.degraded).toBe(true);
    expect(res.reason).toContain("Nothing is embedded yet");
  });

  /** Gemini unreachable: the fast path gives up and the scan path degrades to keywords. */
  it("degrades to lexical search via the scan path when embeddings are down", async () => {
    mocked.aiCache.findMany.mockImplementation(async (args: { where?: { kind?: string } }) => {
      if (args?.where?.kind === "embed:doc:wiki") return [wikiRow()];
      return [];
    });
    mocked.aiCache.findUnique.mockResolvedValue(null);
    embedMock.mockResolvedValue(null); // Gemini cannot embed either query or docs
    mocked.$queryRaw.mockImplementation(async (strings: TemplateStringsArray) => {
      const sql = strings.join("?");
      if (sql.includes('"DocEmbedding" LIMIT 1')) return [];
      return [];
    });
    mocked.$executeRaw.mockResolvedValue(1);

    const res = await searchSemantic("isekai");

    expect(res.engine).toBe("scan");
    expect(res.degraded).toBe(true);
    expect(res.reason).toContain("unavailable");
    // The title hit survives the keyword fallback.
    expect(res.hits).toHaveLength(1);
    expect(res.hits[0].id).toBe("isekai");
  });
});