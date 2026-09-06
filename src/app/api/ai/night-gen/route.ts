import { auth } from "@/lib/auth";
import { consumeAiQuota, geminiGenerate, parseGeminiJson, aiCacheKey, isGeminiConfigured, AiQuotaError } from "@/lib/gemini";
import { searchMedia, bestTitle } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

interface NightFriend {
  name: string;
  tastes: string; // e.g. "action, Jujutsu Kaisen, 12 eps"
}

interface AnimePick {
  title: string;
  reason: string;
  mpv_episode?: string;
}

interface NightPlan {
  theme: string;
  lineup: AnimePick[];
  order_note: string;
  snacks: string[];
  quiz: { question: string; answer: string }[];
  why: string;
}

function parseTasteList(friends: NightFriend[]): string {
  return friends
    .map((f) => `${f.name || "Friend"}: ${f.tastes || "no prefs (open-minded)"}`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to plan an anime night." }, { status: 401 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json({ error: "AI isn't configured yet." }, { status: 503 });
  }

  let body: { friends?: NightFriend[]; mood?: string; duration?: string; createParty?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const friends = (body.friends ?? []).slice(0, 8);
  if (friends.length === 0) {
    return NextResponse.json({ error: "Add at least one friend's taste to plan the night." }, { status: 400 });
  }
  const mood = (body.mood || "chill").slice(0, 120);
  const duration = (body.duration || "3-4 hours").slice(0, 40);

  try {
    await consumeAiQuota(session.user.id);
  } catch (e) {
    if (e instanceof AiQuotaError) {
      return NextResponse.json({ error: e.message }, { status: 429 });
    }
    throw e;
  }

  const cacheKey = aiCacheKey("night-gen", JSON.stringify({ f: friends, m: mood, d: duration }));
  const system =
    "You are Zyni's awesome anime night planner. You blend a group's tastes into one epic anime night plan. " +
    "Always reply ONLY with valid JSON matching this shape: " +
    '{"theme":"one-line night theme", "lineup":[{"title":"anime title", "reason":"why it fits", "mpv_episode":"optional episode to start, e.g. \\"EP 1\\", or omit"}], "order_note":"how to order the night", "snacks":["3 snack ideas"], "quiz":[{"question":"one trivia Q about the night", "answer":"answer"}], "why":"short verdict"}. ' +
    "Prefer short (12-25 ep) anime anyone can get into unless the group clearly wants a long one. " +
    "Keep it hype but only recommend real, popular anime titles so they resolve on AniList.";

  const prompt =
    `Friends and tastes:\n${parseTasteList(friends)}\n\n` +
    `Night mood: ${mood}\nTarget duration: ${duration}\n\n` +
    "Build the plan (JSON only).";

  const raw = await geminiGenerate({ system, prompt, json: true, cacheKey });
  const plan = parseGeminiJson<NightPlan>(raw);
  if (!plan || !Array.isArray(plan.lineup)) {
    return NextResponse.json({ error: "AI returned an unreadable plan. Try again." }, { status: 502 });
  }

  // Resolve titles -> AniList ids so we can link + create a party
  const picks: (AnimePick & { id?: number; image?: string | null; year?: number | null })[] = [];
  for (const pick of plan.lineup.slice(0, 6)) {
    const res = await searchMedia({ search: pick.title, type: "ANIME", page: 1, perPage: 3 });
    const best = res.media[0];
    picks.push({
      title: best ? bestTitle(best.title) : pick.title,
      reason: pick.reason,
      mpv_episode: pick.mpv_episode,
      id: best?.id,
      image: best?.coverImage?.extraLarge ?? best?.coverImage?.large ?? null,
      year: best?.startDate?.year ?? null,
    });
  }

  let party: { id: string } | undefined;
  if (body.createParty && picks[0]?.id) {
    try {
      const { createParty } = await import("@/lib/watch-party");
      const p = await createParty(session.user.id, picks[0].id, picks[0].title, picks[0].image ?? null, null, undefined);
      party = { id: p.id };
    } catch (e) {
      console.error("[/api/ai/night-gen] createParty failed", e);
    }
  }

  return NextResponse.json({
    plan: {
      theme: plan.theme,
      lineup: picks,
      order_note: plan.order_note,
      snacks: plan.snacks,
      quiz: plan.quiz,
      why: plan.why,
    },
    party,
  });
}