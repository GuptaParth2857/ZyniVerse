import { NextRequest, NextResponse } from "next/server";
import {
  EMBED_GLOBAL_DAILY_LIMIT,
  EMBED_PER_USER_DAILY_LIMIT,
  EMBED_SCOPE,
  isEmbeddingConfigured,
} from "@/lib/embeddings";
import { AiQuotaError, consumeScopedQuota } from "@/lib/gemini";
import { isSource, searchSemantic, SOURCES, SOURCE_LABEL } from "@/lib/semantic-index";
import { getSessionUserId } from "@/lib/session-user";

export const dynamic = "force-dynamic";

const MAX_QUERY_CHARS = 300;

/**
 * Meaning-based search over the site's written and structured content.
 *
 * Signed-out visitors are allowed, but they share the anonymous quota bucket:
 * embeddings cost real money per call, and this endpoint is reachable by anyone
 * who can load the site. Signed-in users get their own bucket so one script
 * cannot exhaust the allowance for everyone.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ error: "Pass ?q= something to search for." }, { status: 400 });
  }
  if (q.length > MAX_QUERY_CHARS) {
    return NextResponse.json({ error: `Query is too long (max ${MAX_QUERY_CHARS} characters).` }, { status: 400 });
  }

  const sourceParam = params.get("sources");
  const sources = sourceParam
    ? sourceParam.split(",").map((s) => s.trim()).filter(isSource)
    : undefined;
  if (sourceParam && sources?.length === 0) {
    return NextResponse.json(
      { error: `sources must be a subset of: ${SOURCES.join(", ")}` },
      { status: 400 }
    );
  }

  const limitRaw = Number(params.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 50) : 12;

  if (isEmbeddingConfigured()) {
    const userId = (await getSessionUserId(req.headers)) ?? "__anonymous__";
    try {
      await consumeScopedQuota({
        scope: EMBED_SCOPE,
        userId,
        perUserLimit: EMBED_PER_USER_DAILY_LIMIT,
        globalLimit: EMBED_GLOBAL_DAILY_LIMIT,
        perUserMessage: `You have used all ${EMBED_PER_USER_DAILY_LIMIT} semantic searches today. Come back tomorrow!`,
        globalMessage: "Semantic search has hit its global budget for today. Try again tomorrow.",
      });
    } catch (e) {
      if (e instanceof AiQuotaError) {
        return NextResponse.json({ error: e.message, quota: true }, { status: 429 });
      }
      throw e;
    }
  }

  const result = await searchSemantic(q, { sources, limit });

  return NextResponse.json(
    {
      q,
      sources: sources ?? SOURCES,
      // The client builds its filter row from this rather than keeping its own
      // copy. It used to hardcode wiki/blog/forum in three places, which is why
      // the new sources were invisible in the UI until this was wired up.
      labels: Object.fromEntries(SOURCES.map((s) => [s, SOURCE_LABEL[s]])),
      hits: result.hits,
      count: result.hits.length,
      scanned: result.scanned,
      degraded: result.degraded,
      // Which engine answered: the pgvector mirror once the DocEmbedding
      // migration is applied, otherwise the in-memory scan. Mainly a debugging
      // affordance for confirming the fast path is actually live.
      engine: result.engine ?? "scan",
      ...(result.reason ? { notice: result.reason } : {}),
    },
    {
      headers: {
        // Query embeddings are memoised in AiCache, so an identical repeat is
        // cheap - but the answer can change as content is edited, so this is
        // short-lived rather than the 5 minutes the AniList routes use.
        "Cache-Control": "private, max-age=30",
      },
    }
  );
}