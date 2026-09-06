import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { getFillerForAnime } from "@/lib/filler";
import { getAnimeDetailFull, bestTitle } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use AI summaries." }, { status: 401 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  const { id, spoilerLevel } = (await req.json()) as { id?: number | string; spoilerLevel?: string };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const level = spoilerLevel === "mild" || spoilerLevel === "full" ? spoilerLevel : "none";

  let anime;
  try {
    anime = await getAnimeDetailFull(id);
  } catch {
    return NextResponse.json({ error: "Anime not found." }, { status: 404 });
  }
  const title = bestTitle(anime.title);
  const filler = await getFillerForAnime(anime.id, title);
  if (!filler) {
    return NextResponse.json({ error: "No filler guide data for this anime yet." }, { status: 404 });
  }

  // Compact episode summary for the model — first ~40 episodes to stay in budget.
  const abbrev = filler.episodes.slice(0, 42).map((e) => `Ep ${e.episode}:${e.type.slice(0, 1).toUpperCase()}`).join(" ");
  const statLine = `Total ${filler.total}, filler ${filler.filler} (${filler.fillerPercent}%), manga-canon ${filler.mangaCanon}, anime-canon ${filler.animeCanon}, mixed ${filler.mixed}`;

  const levelInstruction =
    level === "full"
      ? "The user has ENABLED full spoilers. You may freely spoil major plot twists, endings, and reveals, and describe specific filler arcs in detail. Label clearly which episodes contain the biggest reveals."
      : level === "mild"
      ? "The user has enabled mild spoilers. You may mention early-curve plot setup and themes, but DO NOT reveal endings, deaths, or major twists. Keep bigger reveals vague."
      : "SPOILER-FREE. Do not reveal any plot twists, endings, deaths, or big reveals.";

  const SYSTEM = `You are Zyni's anime guide for "${title}".
The user wants to know which episodes are essential and which are skippable filler.
${levelInstruction}
You'll get compact per-episode fill data plus overall stats. Respond with a concise, helpful, HIGH-ENERGY markdown summary.
Structure:
1. **The One-Liner** — is it worth watching and roughly how much filler to skip.
2. **What's Actually Canon** — what the core story follows.
3. **What Filler Adds** — tone of the filler arcs (reuse of canon jokes, world-building, flashbacks).
4. **Quick Rules** — e.g. "skip filler eps X-Y, keep mixed".
Keep it under 120 words${level === "none" ? ", spoiler-free" : ""}, write in a friendly Hinglish mix (Hindi + English) that Indian anime fans enjoy, but keep episode numbers in plain digits.`;

  const prompt = `Stats:\n${statLine}\nEpisode map (first 42):\n${abbrev}\n\nWrite the summary (spoiler level: ${level}).`;

  let reply: string;
  try {
    reply = await geminiGenerate({
      system: SYSTEM,
      prompt,
      cacheKey: aiCacheKey("filler-summary", `${id}:${level}`),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't generate a summary right now." }, { status: 502 });
  }

  // Strip markdown code fences if the model wraps output.
  const clean = reply.replace(/```/g, "").trim();
  return NextResponse.json({ summary: clean, title });
}