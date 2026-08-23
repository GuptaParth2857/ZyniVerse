import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, parseGeminiJson, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { searchMedia, bestTitle } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM = `You are Zyni AI, the anime & manga expert assistant inside ZyniVerse (zyverse.in), an anime community site.
You help users discover anime/manga, answer questions about plots, characters, studios, and where to watch.
Only recommend REAL titles. Keep replies friendly and under 120 words.
Respond ONLY with JSON: {"reply": "...", "recommendations": [{"title": "exact real title", "type": "ANIME" or "MANGA"}]}
Include at most 4 recommendations only when they are directly relevant; otherwise use an empty array.`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use Zyni AI." }, { status: 401 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }
  const recent = messages.slice(-8);
  const lastUser = [...recent].reverse().find((m) => m.role === "user")?.content ?? "";

  let text: string;
  try {
    text = await geminiGenerate({
      system: SYSTEM,
      turns: recent.map((m) => ({ role: m.role === "assistant" ? "model" : "user", text: m.content })),
      json: true,
      cacheKey: lastUser ? aiCacheKey("chat", `${lastUser}|${recent.length <= 2 ? "" : "ctx"}`) : null,
    });
  } catch {
    return NextResponse.json({ error: "Zyni AI couldn't respond right now. Try again in a moment." }, { status: 502 });
  }

  interface ParsedReply {
    reply?: string;
    recommendations?: { title?: string; type?: string }[];
  }
  const parsed = parseGeminiJson<ParsedReply>(text);
  const reply = parsed?.reply ?? text;
  const recs = (parsed?.recommendations ?? []).slice(0, 4);

  const media = (
    await Promise.allSettled(
      recs
        .filter((r) => r.title)
        .map((r) => searchMedia({ search: r.title!, type: r.type === "MANGA" ? "MANGA" : "ANIME", perPage: 1 }))
    )
  )
    .map((r) => (r.status === "fulfilled" ? r.value.media[0] : null))
    .filter((m): m is NonNullable<typeof m> => Boolean(m?.id))
    .slice(0, 4)
    .map((m) => ({
      id: m.id,
      title: bestTitle(m.title),
      poster: m.coverImage?.large ?? null,
      format: m.format ?? null,
      year: m.startDate?.year ?? null,
      type: m.type as string,
    }));

  return NextResponse.json({ reply, media });
}
