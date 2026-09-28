import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeQualifying, finalizeRound } from "@/lib/character-tournaments";

export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: { task: string; status: number; detail: string }[] = [];
  // Per-invocation, not module-level: a warm lambda reused this array across
  // requests, so it grew for the life of the container and re-sent the same
  // notifications on every later run.
  const pendingNotifications: { title: string; body: string; link: string }[] = [];

  // 1. Close qualifying polls whose window has ended → build the bracket.
  const qualifying = await prisma.characterTournament.findMany({
    where: { status: "qualifying", mode: "qualifying", qualifyingEndsAt: { lte: now } },
    select: { id: true, title: true },
  });

  let qualified = 0;
  let qualErrors = 0;
  for (const t of qualifying) {
    try {
      const res = await finalizeQualifying(t.id);
      qualified++;
      const d = res.decidedBy;
      console.log(
        `[cron] qualified "${t.title}": ${res.qualifiers.length} seeds ` +
          `(votes=${d.withVotes}, popularity=${d.byPopularityTiebreak}, insertion=${d.byInsertionOrder}, totalVotes=${d.totalVotesCast})`
      );
      pendingNotifications.push({
        title: `⚔️ "${t.title}" — bracket is LIVE!`,
        body: `${res.qualifiers.length} characters qualified. Round 1 voting is open for ${3} days!`,
        link: `/character-tournaments/${t.id}`,
      });
    } catch (e) {
      qualErrors++;
      // Previously swallowed entirely, so a tournament could sit past its window
      // with status "qualifying" and nobody could tell why.
      console.error(`[cron] finalizeQualifying failed for ${t.id} (${t.title}):`, e);
    }
  }
  results.push({
    task: "close-qualifying",
    status: qualErrors > 0 ? 207 : 200,
    detail: `closed=${qualified} errors=${qualErrors}`,
  });

  // 2. Advance overdue bracket rounds (and crown champions).
  let advanced = 0;
  let championed = 0;
  let roundErrors = 0;
  for (let guard = 0; guard < 10; guard++) {
    const due = await prisma.characterTournament.findMany({
      where: { status: "active", mode: "bracket", roundEndsAt: { lte: now } },
      select: { id: true, title: true, currentRound: true, totalRounds: true },
      take: 20,
    });
    if (due.length === 0) break;

    for (const t of due) {
      try {
        const res = await finalizeRound(t.id);
        if (res.completed) {
          championed++;
          pendingNotifications.push({
            title: `🏆 "${t.title}" has a champion!`,
            body: res.finalWinner ? `${res.finalWinner.charName} takes the crown.` : "Voting is complete.",
            link: `/character-tournaments/${t.id}`,
          });
        } else {
          advanced++;
          pendingNotifications.push({
            title: `⚔️ "${t.title}" — Round ${res.nextRound} voting open!`,
            body: "3 days to decide who moves on. Your vote decides!",
            link: `/character-tournaments/${t.id}`,
          });
        }
      } catch (e) {
        roundErrors++;
        console.error(`[cron] finalizeRound failed for ${t.id} (${t.title}):`, e);
      }
    }
  }
  results.push({
    task: "advance-rounds",
    status: roundErrors > 0 ? 207 : 200,
    detail: `advanced=${advanced} champions=${championed} errors=${roundErrors}`,
  });

  // 3. Fan out in-app notifications (dedup by exact title per type).
  let created = 0;
  if (pendingNotifications.length > 0) {
    const titles = pendingNotifications.map((n) => n.title);
    const sent = await prisma.notification.findMany({
      where: { type: "TOURNAMENT", title: { in: titles } },
      select: { title: true },
    });
    const sentSet = new Set(sent.map((n) => n.title));
    const toSend = pendingNotifications.filter((n) => !sentSet.has(n.title));
    if (toSend.length > 0) {
      const users = await prisma.user.findMany({ select: { id: true } });
      if (users.length > 0) {
        const payload = toSend.flatMap((c) =>
          users.map((u) => ({
            userId: u.id,
            type: "TOURNAMENT" as const,
            title: c.title,
            body: c.body,
            link: c.link,
          }))
        );
        const res = await prisma.notification.createMany({ data: payload });
        created = res.count;
      }
    }
  }
  results.push({
    task: "notify",
    status: 200,
    detail: `candidates=${pendingNotifications.length} created=${created}`,
  });

  return NextResponse.json({ ok: true, results });
}
