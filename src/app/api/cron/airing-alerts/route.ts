import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaBatch, bestTitle } from "@/lib/anilist";
import { createNotification } from "@/lib/notifications";

export const revalidate = 0;
export const maxDuration = 60;

const HOUR_MS = 36_00_000;
const PRE_ALERT_HOURS = 36; // alert 36h before an episode drops
const CATCHUP_HOURS = 6; // also alert if it aired in the last 6h (missed it)
const MAX_NOTIFICATIONS = 400;

async function fetchBatch(ids: number[]) {
  const unique = [...new Set(ids)];
  const out: Awaited<ReturnType<typeof getMediaBatch>>[number][] = [];
  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);
    try {
      const res = await getMediaBatch(chunk);
      out.push(...res);
    } catch { /* skip a chunk rather than fail the whole run */ }
  }
  return out;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const windowStart = new Date(now - CATCHUP_HOURS * HOUR_MS);
  const windowEnd = new Date(now + PRE_ALERT_HOURS * HOUR_MS);
  const results: { task: string; detail: string }[] = [];
  let created = 0;

  // ── Source A: precise per-episode "Notify me on Ep N" alerts ──
  const planned = await prisma.airingAlert.findMany({
    where: { notified: false, airingAt: { gte: windowStart, lte: windowEnd } },
    select: { userId: true, mediaId: true, episode: true, airingAt: true },
  });

  // ── Source B: globally followed anime (AnimeFollow "🔔 Follow") ──
  const follows = await prisma.animeFollow.findMany({
    select: { userId: true, mediaId: true },
  });
  const followedByMedia = new Map<number, Set<string>>();
  for (const f of follows) {
    const set = followedByMedia.get(f.mediaId) || new Set<string>();
    set.add(f.userId);
    followedByMedia.set(f.mediaId, set);
  }

  const allMediaIds = [...new Set([
    ...planned.map((p) => p.mediaId),
    ...followedByMedia.keys(),
  ])];

  const mediaMap = new Map(
    (await fetchBatch(allMediaIds)).map((m) => [m.id, m])
  );

  type Pending = { userId: string; mediaId: number; episode: number; airingAt: Date };
  const pending: Pending[] = [];

  for (const p of planned) pending.push(p);

  // Pre-existing dedupe ledger for followed anime (episode already alerted).
  const alertableMedia = [...followedByMedia.entries()].filter(([mediaId]) => {
    const m = mediaMap.get(mediaId);
    return m?.nextAiringEpisode && m.nextAiringEpisode.airingAt;
  });
  const dedupeKeys = new Set<string>();
  if (alertableMedia.length > 0) {
    const existing = await prisma.airingAlert.findMany({
      where: {
        notified: true,
        mediaId: { in: alertableMedia.map(([id]) => id) },
      },
      select: { userId: true, mediaId: true, episode: true },
    });
    for (const e of existing) dedupeKeys.add(`${e.userId}:${e.mediaId}:${e.episode}`);
  }

  for (const [mediaId, userIds] of followedByMedia) {
    const m = mediaMap.get(mediaId);
    const ep = m?.nextAiringEpisode;
    if (!ep?.airingAt) continue;
    const airingAt = ep.airingAt * 1000;
    if (airingAt < now - CATCHUP_HOURS * HOUR_MS || airingAt > now + PRE_ALERT_HOURS * HOUR_MS) continue;
    for (const userId of userIds) {
      if (dedupeKeys.has(`${userId}:${mediaId}:${ep.episode}`)) continue;
      pending.push({ userId, mediaId, episode: ep.episode, airingAt: new Date(airingAt) });
    }
  }

  // ── Fan out, dedupe by the AiringAlert unique key so cron re-runs are safe ──
  const sendBatch = pending.slice(0, MAX_NOTIFICATIONS);
  for (const p of sendBatch) {
    const m = mediaMap.get(p.mediaId);
    const name = m ? bestTitle(m.title) : `#${p.mediaId}`;
    const airingMs = p.airingAt.getTime();
    const soon = airingMs > now;
    const hours = Math.max(0, Math.ceil((airingMs - now) / HOUR_MS));
    const body = soon
      ? `Ep ${p.episode} of ${name} releases in ${hours}h`
      : `Ep ${p.episode} of ${name} just aired — watch now!`;
    const notif = await createNotification({
      userId: p.userId,
      type: "AIRING",
      title: name,
      body,
      link: `/anime/${p.mediaId}`,
    });
    if (notif) created++;

    // Mark the source row notified (this also acts as the dedupe ledger).
    await prisma.airingAlert.upsert({
      where: { userId_mediaId_episode: { userId: p.userId, mediaId: p.mediaId, episode: p.episode } },
      update: { notified: true, airingAt: p.airingAt },
      create: { userId: p.userId, mediaId: p.mediaId, episode: p.episode, airingAt: p.airingAt, notified: true },
    });
  }

  results.push({ task: "airing-alerts", detail: `planned=${planned.length} followed=${follows.length} queue=${pending.length} notifications=${created}` });

  return NextResponse.json({ ok: true, results });
}