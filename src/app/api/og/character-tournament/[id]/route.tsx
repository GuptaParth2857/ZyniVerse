import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let t = null;
  try {
    t = await prisma.characterTournament.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        size: true,
        status: true,
        mode: true,
        bracketSize: true,
        totalRounds: true,
        creator: { select: { username: true } },
        participants: {
          orderBy: { seed: "asc" },
          take: 3,
          select: { charName: true, charImage: true, seed: true },
        },
      },
    });
  } catch {
    t = null;
  }
  if (!t) return new Response("Not found", { status: 404 });

  let totalVotes = 0;
  let leaders: { charName: string; charImage: string | null; pollVotes: number }[] = [];

  if (t.mode === "qualifying") {
    const [agg, top] = await Promise.all([
      prisma.characterTournamentParticipant
        .aggregate({ where: { tournamentId: id }, _sum: { pollVotes: true } })
        .catch(() => null),
      prisma.characterTournamentParticipant
        .findMany({
          where: { tournamentId: id },
          orderBy: [{ pollVotes: "desc" }, { createdAt: "asc" }],
          take: 5,
          select: { charName: true, charImage: true, pollVotes: true },
        })
        .catch(() => []),
    ]);
    totalVotes = agg?._sum.pollVotes || 0;
    leaders = top;
  } else {
    const votes = await prisma.characterTournamentMatch
      .aggregate({ where: { tournamentId: id }, _sum: { votesA: true, votesB: true } })
      .catch(() => null);
    totalVotes = (votes?._sum.votesA || 0) + (votes?._sum.votesB || 0);
  }

  let champion: { charName: string; charImage: string | null } | null = null;
  if (t.status === "completed" && t.mode !== "qualifying") {
    const finalMatch = await prisma.characterTournamentMatch
      .findFirst({
        where: { tournamentId: id, round: t.totalRounds },
        include: { winner: { select: { charName: true, charImage: true } } },
      })
      .catch(() => null);
    champion = finalMatch?.winner ?? null;
  }

  const desc = (t.description || "Anime characters going head-to-head.").slice(0, 160);
  const statusColor =
    t.status === "completed" ? "#34d399" : t.status === "qualifying" ? "#22d3ee" : t.status === "active" ? "#f472b6" : "#a78bfa";
  const statusText =
    t.status === "completed" ? "🏆 Completed" : t.status === "qualifying" ? "⚡ Qualifying — vote now" : t.status;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "#0b0614",
          backgroundImage: "radial-gradient(80% 80% at 20% 30%, rgba(217,70,239,0.35), transparent 60%), radial-gradient(80% 80% at 80% 30%, rgba(34,211,238,0.28), transparent 60%), linear-gradient(150deg, #14091f 0%, #0b0614 70%)",
          padding: "52px 64px 44px",
          color: "#f5f2fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "rgba(168,85,247,0.18)",
              border: "1px solid rgba(168,85,247,0.55)",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 26,
              fontWeight: 800,
              color: "#e9d5ff",
              letterSpacing: 2,
            }}
          >
            ⚔️ ZYNIVERSE CHARACTER TOURNAMENT
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              backgroundColor: "rgba(7,3,12,0.55)",
              border: `1px solid ${statusColor}66`,
              color: statusColor,
              borderRadius: 999,
              padding: "8px 18px",
              textTransform: "uppercase",
            }}
          >
            {statusText}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: t.title.length > 34 ? 52 : 64,
            fontWeight: 900,
            marginTop: 34,
            lineHeight: 1.1,
          }}
        >
          {t.title}
        </div>

        <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#bca6e8", marginTop: 18, lineHeight: 1.35 }}>
          {desc}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 26, color: "#9b8ab0", fontSize: 28, fontWeight: 700 }}>
          <span>{t.size} {t.mode === "qualifying" ? "CANDIDATES" : "PLAYERS"}</span>
          <span>·</span>
          {t.mode === "qualifying" ? (
            <>
              <span>TOP {t.bracketSize} MAKE THE BRACKET</span>
              <span>·</span>
            </>
          ) : null}
          <span>{fmt(totalVotes)} VOTES</span>
          <span>·</span>
          <span>BY @{t.creator.username.toUpperCase()}</span>
        </div>

        {champion ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginTop: 34,
              backgroundColor: "rgba(52,211,153,0.12)",
              border: "1px solid rgba(52,211,153,0.5)",
              borderRadius: 999,
              padding: "14px 30px",
              alignSelf: "flex-start",
            }}
          >
            {champion.charImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={champion.charImage}
                alt=""
                width={84}
                height={84}
                style={{ objectFit: "cover", width: 84, height: 84, borderRadius: 999, border: "2px solid #34d399" }}
              />
            ) : (
              <span style={{ fontSize: 64 }}>👑</span>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: "#6ee7b7" }}>CHAMPION</span>
              <span style={{ fontSize: 44, fontWeight: 900, color: "#ffffff" }}>{champion.charName}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: t.mode === "qualifying" ? 14 : 18,
              marginTop: t.mode === "qualifying" ? 30 : 36,
            }}
          >
            {t.mode === "qualifying"
              ? leaders.map((p, i) => {
                  const rank = i + 1;
                  return (
                    <div
                      key={p.charName + rank}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        backgroundColor: "rgba(34,211,238,0.08)",
                        border: rank <= 3 ? "1px solid rgba(34,211,238,0.6)" : "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 20,
                        padding: "16px 18px",
                        width: 180,
                      }}
                    >
                      {p.charImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.charImage}
                          alt=""
                          width={72}
                          height={72}
                          style={{ objectFit: "cover", width: 72, height: 72, borderRadius: 14 }}
                        />
                      ) : (
                        <span style={{ fontSize: 40 }}>🎭</span>
                      )}
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#e5dcf5", textAlign: "center" }}>{p.charName}</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#22d3ee" }}>#{rank} · {fmt(p.pollVotes)} votes</span>
                    </div>
                  );
                })
              : t.participants.map((p) => (
                  <div
                    key={p.charName}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 20,
                      padding: "16px 22px",
                      width: 150,
                    }}
                  >
                    {p.charImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.charImage}
                        alt=""
                        width={72}
                        height={72}
                        style={{ objectFit: "cover", width: 72, height: 72, borderRadius: 14 }}
                      />
                    ) : (
                      <span style={{ fontSize: 40 }}>🎭</span>
                    )}
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#e5dcf5", textAlign: "center" }}>{p.charName}</span>
                  </div>
                ))}
          </div>
        )}

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", height: 4, width: "100%", borderRadius: 4, backgroundColor: "#a855f7" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#9b8ab0" }}>
            Vote your favorite → zyverse.in/character-tournaments/{id}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}