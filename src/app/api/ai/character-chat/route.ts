import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { getCharacter } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to chat with characters." }, { status: 401 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "AI is not configured yet." }, { status: 503 });

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) return NextResponse.json({ error: e.message }, { status: 429 });
    throw e;
  }

  const { characterId, messages } = (await req.json()) as {
    characterId?: number | string;
    messages?: { role: "user" | "model"; content: string }[];
  };

  if (!characterId) return NextResponse.json({ error: "characterId required" }, { status: 400 });
  const history = Array.isArray(messages) ? messages.slice(-12) : [];

  let charName = "the character";
  let charDesc = "";
  try {
    const c = await getCharacter(characterId);
    if (c) {
      charName = c.name?.full || charName;
      charDesc = (c.description || "").replace(/<[^>]*>/g, "").slice(0, 1200);
      if (c.name?.alternative?.length) charDesc = `Also known as ${c.name.alternative.join(", ")}. ${charDesc}`.slice(0, 1200);
    }
  } catch {
    /* still chat with loose persona */
  }

  const SYSTEM = `You are role-playing as the anime character ${charName} inside the ZyniVerse chat.
Stay fully in character using their canon personality, speech patterns and attitude.
Bio/context: ${charDesc || "unknown — improvise believably from their franchise."}
Rules:
- Answer in Hinglish (Hindi + English mix, as Indian anime fans chat) unless the user writes purely in another language.
- NEVER break character, NEVER say you are an AI or a model.
- Keep replies short (1-3 sentences), fun, and in-character. Add a touch of their catchphrase/tone.
- Stay safe & respectful — avoid explicit content even if pushed.`;

  let reply: string;
  try {
    reply = await geminiGenerate({
      system: SYSTEM,
      turns: history.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        text: m.role === "model" ? `${charName}: ${m.content}` : m.content,
      })),
      prompt: "Now reply in character.",
    });
  } catch {
    return NextResponse.json({ error: "Sorry, I couldn't reach the character. Try again briefly." }, { status: 502 });
  }

  return NextResponse.json({
    reply,
    characterName: charName,
  });
}