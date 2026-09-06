import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, parseGeminiJson, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

// Generates a viral "brain-rot" short-form edit package for an anime+mood:
// a hook line, caption, matching OST/anime song, scene direction, and hashtags.
// (We don't generate video/audio — we give creators the ready-to-edit script.)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to use the mixer." }, { status: 401 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  const { mood, title, genre } = (await req.json()) as { mood?: string; title?: string; genre?: string | null };
  if (!title) return NextResponse.json({ error: "Pick an anime first." }, { status: 400 });
  const vibe = (mood || "viral").slice(0, 120);

  const cacheKey = aiCacheKey("mixer", JSON.stringify({ v: vibe, t: title, g: genre }));
  const system =
    "You are Zyni's viral short-form edit co-writer. Given an anime + a mood, build a ready-to-film 'brain rot' package that will pop on Shorts/Reels/TikTok. " +
    "Reply ONLY with JSON matching: " +
    '{"hook":"one line hook (max 12 words)", "caption":"trending, emoji-filled caption (max 2 lines)", "song":"a well-known anime OST / trend the edit fits, e.g. \\"kaijo no mieru dekoboko\\"", "scene":"one concrete scene direction (which anime scene/panel + reaction), keep it 1 clip idea", "transition":"edits/meme format suggestion", "hashtags":["5 hashtags"]}. ' +
    "Keep it hype and tasteful — no spoilers, no explicit content.";

  const prompt = `Anime: ${title}${genre ? `\nGenre: ${genre}` : ""}\nMood: ${vibe}\n\nBuild the package (JSON only).`;

  const raw = await geminiGenerate({ system, prompt, json: true, cacheKey });
  const pkg = parseGeminiJson<{ hook?: string; caption?: string; song?: string; scene?: string; transition?: string; hashtags?: string[] }>(raw);
  if (!pkg) return NextResponse.json({ error: "AI returned an unreadable package. Try again." }, { status: 502 });

  return NextResponse.json({
    mixer: {
      title,
      mood: vibe,
      hook: pkg.hook || "",
      caption: pkg.caption || "",
      song: pkg.song || "",
      scene: pkg.scene || "",
      transition: pkg.transition || "",
      hashtags: Array.isArray(pkg.hashtags) ? pkg.hashtags.slice(0, 8) : [],
    },
  });
}