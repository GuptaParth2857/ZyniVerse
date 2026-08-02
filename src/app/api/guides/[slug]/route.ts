import { NextRequest, NextResponse } from "next/server";
import { getANNNews, getMALNews } from "@/lib/news";
import { dedupedFetch } from "@/lib/wiki-cache";
import { logError } from "@/lib/logger";

interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  source: string;
  url: string;
  tags: string[];
  publishedAt: string;
}

async function fetchArticleContent(url: string): Promise<{ content: string; image: string }> {
  return dedupedFetch(`guide-content-v4:${url}`, async () => {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return { content: "", image: "" };
      const html = await res.text();

      let image = "";
      const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      if (ogImg) {
        image = ogImg[1];
      } else {
        const lazyImg = html.match(/data-src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/i);
        if (lazyImg) image = lazyImg[1];
        else {
          const firstImg = html.match(/<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/i);
          if (firstImg) image = firstImg[1];
        }
      }
      if (image && !image.startsWith("http")) {
        const base = new URL(url);
        image = `${base.origin}${image.startsWith("/") ? "" : "/"}${image}`;
      }

      let content = "";

      const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      if (articleMatch) {
        content = articleMatch[1];
      }

      if (!content || content.length < 200) {
        const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
        const meaningful = paragraphs.filter((p) => {
          const text = p.replace(/<[^>]+>/g, "").trim();
          return text.length > 30 && !text.toLowerCase().includes("cookie") && !text.toLowerCase().includes("privacy") && !text.toLowerCase().includes("subscribe") && !text.toLowerCase().includes("sign up") && !text.toLowerCase().includes("newsletter");
        });
        if (meaningful.length >= 2) {
          content = meaningful.join("\n\n");
        }
      }

      content = content
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[\s\S]*?<\/footer>/gi, "")
        .replace(/<header[\s\S]*?<\/header>/gi, "")
        .replace(/<aside[\s\S]*?<\/aside>/gi, "")
        .replace(/<div[^>]*class=["'][^"']*(?:sidebar|related|advertisement|ad-|social)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "")
        .replace(/<figure[\s\S]*?<\/figure>/gi, "")
        .replace(/<img[^>]+>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

      const sentences = content.split(/(?<=[.!?])\s+/);
      const paragraphs: string[] = [];
      let current = "";
      for (const sentence of sentences) {
        current += (current ? " " : "") + sentence;
        if (current.length > 120) {
          paragraphs.push(current.trim());
          current = "";
        }
      }
      if (current.trim()) paragraphs.push(current.trim());
      content = paragraphs.join("\n\n");

      return { content, image };
    } catch (e) {
      console.error("Failed to fetch article content:", e);
      return { content: "", image: "" };
    }
  }, 60 * 60 * 1000);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const liveArticles = await dedupedFetch("guides:live-v2", async () => {
    const articles: GuideArticle[] = [];
    try {
      const [annNews, malNews] = await Promise.all([getANNNews(), getMALNews()]);
      for (const item of [...annNews, ...malNews]) {
        articles.push({
          id: item.id,
          slug: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content || "",
          image: item.image || "",
          source: item.source === "News" ? "ANN" : "MAL",
          url: item.url,
          tags: item.tags,
          publishedAt: item.publishedAt,
        });
      }
    } catch (e) { logError(e); }
    return articles;
  }, 30 * 60 * 1000);

  const found = liveArticles.find((a) => a.slug === slug || a.id === slug);
  if (!found) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let fullContent = "";
  let fullImage = found.image || "";

  if (found.url) {
    const fetched = await fetchArticleContent(found.url);
    fullContent = fetched.content;
    if (fetched.image && !fullImage) fullImage = fetched.image;
  }

  if (!fullContent) {
    fullContent = found.content || found.summary || found.title;
  }

  return NextResponse.json({
    id: found.id,
    slug: found.slug,
    title: found.title,
    excerpt: found.summary,
    content: fullContent,
    image: fullImage,
    source: found.source,
    tags: found.tags,
    publishedAt: found.publishedAt,
    externalUrl: found.url,
  }, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
  });
}
