import { createHash } from "crypto";
import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, parseGeminiJson, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { searchMedia, bestTitle } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const MAX_SIZE = 5 * 1024 * 1024;

const SYSTEM = `You are an anime screenshot identifier. Look at the image and identify the anime series or movie.
Respond ONLY with JSON:
{"title": "exact real anime title", "confidence": 0-100, "episode_guess": "e.g. S1E5 or 'unknown'", "characters": ["names you recognize, max 4"], "scene": "one-line scene description"}
If you are not sure, give your best guess with a low confidence score. NEVER invent a title that doesn't exist.`;

interface Identification {
  title?: string;
  confidence?: number;
  episode_guess?: string;
  characters?: string[];
  scene?: string;
}

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

  let file: File | null = null;
  try {
    const form = await req.formData();
    const value = form.get("image");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "No image provided." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images are supported." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Image too large (max 5MB)." }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  let text: string;
  try {
    text = await geminiGenerate({
      system: SYSTEM,
      prompt: "Identify this anime screenshot.",
      image: { mime: file.type, base64 },
      json: true,
      cacheKey: aiCacheKey("identify", `img:${createHash("sha256").update(buffer).digest("hex")}`),
    });
  } catch {
    return NextResponse.json({ error: "Couldn't analyze the image right now. Try again shortly." }, { status: 502 });
  }

  const id = parseGeminiJson<Identification>(text);
  if (!id?.title) return NextResponse.json({ error: "Couldn't identify this screenshot. Try a clearer one." }, { status: 422 });

  let matches: { id: number; title: string; poster: string | null; year: number | null; format: string | null; type: string }[] = [];
  try {
    const found = await searchMedia({ search: id.title, perPage: 3 });
    matches = found.media.slice(0, 3).map((m) => ({
      id: m.id,
      title: bestTitle(m.title),
      poster: m.coverImage?.large ?? null,
      year: m.startDate?.year ?? null,
      format: m.format ?? null,
      type: String(m.type),
    }));
  } catch {
    // matches optional
  }

  return NextResponse.json({
    identification: {
      title: id.title,
      confidence: typeof id.confidence === "number" ? Math.round(id.confidence) : null,
      episodeGuess: id.episode_guess ?? null,
      characters: Array.isArray(id.characters) ? id.characters.slice(0, 4) : [],
      scene: id.scene ?? null,
    },
    matches,
  });
}
