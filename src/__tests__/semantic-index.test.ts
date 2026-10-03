/**
 * Guards the hrefs that the semantic index hands to the UI.
 *
 * These were wrong once already: the index pointed at
 * `/forum/thread/${slug}` while every other link in the codebase points at
 * `/forum/thread/${id}`. A dead href in a search result is worse than no
 * result - it looks like the document exists and simply refuses to open - and no
 * unit test on vector maths would ever have caught it.
 */
import { describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { sourceDocuments } from "@/lib/semantic-index";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    wikiPage: { findMany: vi.fn() },
    blogPost: { findMany: vi.fn() },
    forumThread: { findMany: vi.fn() },
  },
}));

const mocked = prisma as unknown as {
  wikiPage: { findMany: ReturnType<typeof vi.fn> };
  blogPost: { findMany: ReturnType<typeof vi.fn> };
  forumThread: { findMany: ReturnType<typeof vi.fn> };
};

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