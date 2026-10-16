import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { finalizeQualifying, finalizeRound } from "@/lib/character-tournaments";
import { createCronBudget, cronJson, readStep } from "@/lib/cron-chunk";

export const revalidate = 0;
export const maxDuration = 60;

/**
 * Bracket work used to run in one invocation: every overdue qualifying poll,
 * then up to 10 sweeps of 20 overdue rounds, then a notification fan-out. That
 * regularly overran the 60s function cap, so the caller only ever saw a 504.
 *
 * It is now two steps (close qualifying, advance rounds) that each process at
 * most `*_LIMIT` tournaments per call. Every state change notifies inline, so
 * stopping early never drops a notification - the next chunk picks up whatever
 * is still due, because a finished tournament no longer matches the query.
 */
const QUALIFY_LIMIT = 2;
const ROUND_LIMIT = 2;

/** One tournament announcement, fanned out to every user. */
type TournamentNotice = { title: string; body: string; link: string };

/**
 * Fan out one tournament notification to all users, deduped by exact title per
 * type. Checked per notification (instead of diffing a batch) so a chunked run
 * that stops early can safely resume without re-notifying anyone.
 */
async function sendTournamentNotification(c: TournamentNotice): Promise<number> {
  const already = await prisma.notification.findFirst({
    where: { type: "TOURNAMENT", title: c.title },
    select: { id: true },
  });
  if (already) return 0;

  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) return 0;

  const res = await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "TOURNAMENT" as const,
      title: c.title,
      body: c.body,
      link: c.link,
    })),
  });
  return res.count;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const step = readStep(url.searchParams.get("step"), 1);
  const budget = createCronBudget();
  const now = new Date();
  const results: { task: string; status: number; detail: string }[] = [];
  let processed = 0;
  let hitLimit = false;

  if (step === 0) {
    // 1. Close qualifying polls whose window has ended → build the bracket.
    const due = await prisma.characterTournament.findMany({
      where: { status: "qualifying", mode: "qualifying", qualifyingEndsAt: { lte: now } },
      select: { id: true, title: true },
      take: QUALIFY_LIMIT,
    });

    let qualified = 0;
    let qualErrors = 0;
    let notified = 0;
    for (const t of due) {
      if (processed > 0 && (!budget.hasTime(15_000) || processed >= QUALIFY_LIMIT)) {
        hitLimit = true;
        break;
      }
      processed++;
      try {
        const res = await finalizeQualifying(t.id);
        qualified++;
        const d = res.decidedBy;
        console.log(
          `[cron] qualified "${t.title}": ${res.qualifiers.length} seeds ` +
            `(votes=${d.withVotes}, popularity=${d.byPopularityTiebreak}, insertion=${d.byInsertionOrder}, totalVotes=${d.totalVotesCast})`
        );
        notified += await sendTournamentNotification({
          title: `⚔️ "${t.title}" — bracket is LIVE!`,
          body: `${res.qualifiers.length} characters qualified. Round 1 voting is open for 3 days!`,
          link: `/character-tournaments/${t.id}`,
        });
      } catch (e) {
        qualErrors++;
        // Previously swallowed entirely, so a tournament could sit past its window
        // with status "qualifying" and nobody could tell why.
        console.error(`[cron] finalizeQualifying failed for ${t.id} (${t.title}):`, e);
      }
    }
    if (due.length === QUALIFY_LIMIT && !hitLimit) hitLimit = true;
    results.push({
      task: "close-qualifying",
      status: qualErrors > 0 ? 207 : 200,
      detail: `closed=${qualified} errors=${qualErrors} notifications=${notified}`,
    });
  } else {
    // 2. Advance overdue bracket rounds (and crown champions).
    const due = await prisma.characterTournament.findMany({
      where: { status: "active", mode: "bracket", roundEndsAt: { lte: now } },
      select: { id: true, title: true, currentRound: true, totalRounds: true },
      take: ROUND_LIMIT,
    });

    let advanced = 0;
    let championed = 0;
    let roundErrors = 0;
    let notified = 0;
    for (const t of due) {
      if (processed > 0 && (!budget.hasTime(15_000) || processed >= ROUND_LIMIT)) {
        hitLimit = true;
        break;
      }
      processed++;
      try {
        const res = await finalizeRound(t.id);
        if (res.completed) {
          championed++;
          notified += await sendTournamentNotification({
            title: `🏆 "${t.title}" has a champion!`,
            body: res.finalWinner ? `${res.finalWinner.charName} takes the crown.` : "Voting is complete.",
            link: `/character-tournaments/${t.id}`,
          });
        } else {
          advanced++;
          notified += await sendTournamentNotification({
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
    if (due.length === ROUND_LIMIT && !hitLimit) hitLimit = true;
    results.push({
      task: "advance-rounds",
      status: roundErrors > 0 ? 207 : 200,
      detail: `advanced=${advanced} champions=${championed} errors=${roundErrors} notifications=${notified}`,
    });
  }

  // Stay on this step while it is still finding work, then move on.
  const nextQuery = hitLimit ? `step=${step}` : step === 0 ? "step=1" : null;
  return cronJson(
    {
      ok: results.every((r) => r.status < 500),
      step,
      processed,
      elapsedMs: budget.elapsedMs(),
      results,
    },
    nextQuery
  );
}
