/**
 * Admin backfill: force-close a stuck qualifying tournament and build its
 * bracket, then notify users.
 *
 * The daily cron (`/api/cron/character-tournaments`) already does this, but it
 * only picks up tournaments whose window has *elapsed*. A tournament created
 * before the cron was running can sit in "qualifying" forever, because the cron
 * only ever looks at `qualifyingEndsAt <= now`. This closes it immediately.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/backfill-tournament.ts <tournamentId>
 *
 * Idempotent: re-running against an already-closed tournament is a no-op.
 */
import { prisma } from "@/lib/prisma";
import { finalizeQualifying } from "@/lib/character-tournaments";

const tournamentId = process.argv[2];

async function main() {
  if (!tournamentId) {
    console.error("usage: backfill-tournament.ts <tournamentId>");
    process.exitCode = 2;
    return;
  }

  const t = await prisma.characterTournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, title: true, status: true, mode: true },
  });
  if (!t) {
    console.error(`No tournament with id ${tournamentId}`);
    process.exitCode = 2;
    return;
  }
  console.log("tournament:", JSON.stringify(t));

  if (t.mode !== "qualifying") {
    console.log("Already finalized — nothing to do.");
    return;
  }

  const res = await finalizeQualifying(t.id);
  const d = res.decidedBy;
  console.log(
    `closed: ${res.qualifiers.length} seeds ` +
      `(votes=${d.withVotes}, popularity=${d.byPopularityTiebreak}, insertion=${d.byInsertionOrder}, totalVotes=${d.totalVotesCast})`
  );

  // Same dedup rule the cron uses: skip if this exact title already went out.
  const title = `⚔️ "${t.title}" — bracket is LIVE!`;
  const already = await prisma.notification.findFirst({
    where: { type: "TOURNAMENT", title },
    select: { id: true },
  });
  if (already) {
    console.log("notification already sent — skipping");
    return;
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) {
    console.log("no users to notify");
    return;
  }
  const sent = await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "TOURNAMENT" as const,
      title,
      body: `${res.qualifiers.length} characters qualified. Round 1 voting is open for 3 days!`,
      link: `/character-tournaments/${t.id}`,
    })),
  });
  console.log(`notified ${sent.count} users`);
}

main()
  .catch((e) => {
    console.error("FAILED:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
