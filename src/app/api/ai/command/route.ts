import { getSessionUserId } from "@/lib/session-user";
import {
  AiQuotaError,
  aiCacheKey,
  consumeAiQuota,
  geminiGenerate,
  isGeminiConfigured,
  parseGeminiJson,
} from "@/lib/gemini";
import { commandsFor } from "@/lib/commands";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

const SYSTEM = `You route natural-language requests inside ZyniVerse, an anime database and community site.

You are given the site's pages. Reply with JSON only:
- {"href": "/exact/path"} when the request clearly matches one listed page.
- {"answer": "short answer"} when it does not match a page and you can genuinely help from general anime knowledge.

Rules:
- Only ever return an href that appears verbatim in the page list.
- Never invent a path, query string, or URL.
- Never return admin or moderation pages; they are not in your list.
- Keep an answer under 300 characters and plain text, no markdown.
- When the request is ambiguous between two pages, pick the more general one.`;

interface AiReply {
  href?: string;
  answer?: string;
}

export async function POST(req: NextRequest) {
  // Same shape as the other AI routes: resolve the session only when a cookie
  // is present, so anonymous palette use does not pay for a next-auth round trip.
  const userId = await getSessionUserId(req.headers);
  if (!userId) {
    return NextResponse.json({ error: "Sign in to ask Zyni AI." }, { status: 401 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });
  }

  const { q } = (await req.json()) as { q?: string };
  const query = q?.trim();
  if (!query || query.length < 3 || query.length > 200) {
    return NextResponse.json({ error: "Ask something a little longer." }, { status: 400 });
  }

  try {
    await consumeAiQuota(userId);
  } catch (e) {
    if (e instanceof AiQuotaError) {
      return NextResponse.json({ error: e.message }, { status: 429 });
    }
    throw e;
  }

  // Admin commands are excluded on purpose: this prompt is built from the
  // public registry so moderation paths can never leak into a model context.
  const allowed = commandsFor({ isAuth: true, isAdmin: false });
  const catalog = allowed
    .map((c) => `${c.path} — ${c.label}${c.keywords ? ` (${c.keywords})` : ""}`)
    .join("\n");

  try {
    const text = await geminiGenerate({
      system: SYSTEM,
      prompt: `Pages:\n${catalog}\n\nRequest: ${query}`,
      json: true,
      cacheKey: aiCacheKey("command", query),
    });

    const parsed = parseGeminiJson<AiReply>(text);
    if (!parsed) {
      return NextResponse.json({ error: "Zyni AI could not read its own reply." }, { status: 502 });
    }

    // Trust nothing the model produced. An href is only honoured when it is an
    // exact match for a page this viewer is actually allowed to open, which
    // also means a hallucinated path becomes a harmless no-op instead of a
    // link to something unexpected.
    if (typeof parsed.href === "string") {
      const target = allowed.find((c) => c.path === parsed.href);
      if (target) return NextResponse.json({ href: target.path, label: target.label });
    }

    if (typeof parsed.answer === "string" && parsed.answer.trim()) {
      return NextResponse.json({ answer: parsed.answer.trim().slice(0, 600) });
    }

    return NextResponse.json(
      { error: "No match, and no answer either. Try naming a feature instead." },
      { status: 404 }
    );
  } catch {
    return NextResponse.json({ error: "Zyni AI is unreachable right now." }, { status: 502 });
  }
}