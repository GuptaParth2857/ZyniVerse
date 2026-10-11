import { getSessionUserId } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { askConcierge, clearConversation, getConversation } from "@/lib/concierge";
import { AiQuotaError, consumeAiQuota, isGeminiConfigured } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req.headers);
  if (!userId) return NextResponse.json({ authenticated: false });
  const messages = await getConversation(userId);
  return NextResponse.json({ authenticated: true, messages });
}

export async function POST(req: NextRequest) {
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

  // DNA aggregation wants the display identity; a missing row is a corrupt
  // session, not a valid caller, so treat it the same as anonymous.
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, avatar: true },
  });
  if (!me) {
    return NextResponse.json({ error: "Sign in to ask Zyni AI." }, { status: 401 });
  }

  try {
    const reply = await askConcierge({
      userId,
      username: me.username,
      displayName: me.username,
      avatar: me.avatar,
      query,
    });
    return NextResponse.json(reply);
  } catch {
    return NextResponse.json({ error: "Zyni AI is unreachable right now." }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId(req.headers);
  if (!userId) return NextResponse.json({ authenticated: false });
  await clearConversation(userId);
  return NextResponse.json({ ok: true });
}
