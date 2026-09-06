import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getUserYearRecap } from "@/lib/recap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  const yearParam = Number(req.nextUrl.searchParams.get("year"));
  const year = yearParam && yearParam > 2000 && yearParam <= new Date().getFullYear() ? yearParam : new Date().getFullYear();

  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "You";

  let recap = null;
  if (session?.user?.id) {
    try {
      recap = await getUserYearRecap(session.user.id, year);
    } catch { recap = null; }
  }

  const totalAnime = recap?.totalAnimeWatched ?? 0;
  const eps = recap?.totalEpisodes ?? 0;
  const hours = recap?.hoursWatched ?? 0;
  const completions = recap?.completions ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0614",
          backgroundImage: "linear-gradient(135deg, #101a2b 0%, #2a0f3d 55%, #0b0614 100%)",
          padding: "56px 80px",
          color: "#f5f2fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 46, fontWeight: 800, color: "#29f2e0", letterSpacing: 3 }}>
          🎌 {name}&apos;s {year} in Anime
        </div>

        <div style={{ display: "flex", gap: 34, marginTop: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(41,242,224,0.07)", border: "1px solid rgba(41,242,224,0.3)", borderRadius: 28, padding: "22px 40px" }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: "#ffffff" }}>{totalAnime}</div>
            <div style={{ fontSize: 28, color: "#9b8ab0" }}>Anime</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.35)", borderRadius: 28, padding: "22px 40px" }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: "#ffffff" }}>{eps}</div>
            <div style={{ fontSize: 28, color: "#9b8ab0" }}>Episodes</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(245,208,0,0.08)", border: "1px solid rgba(245,208,0,0.35)", borderRadius: 28, padding: "22px 40px" }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: "#ffffff" }}>{Math.round(hours)}h</div>
            <div style={{ fontSize: 28, color: "#9b8ab0" }}>Watched</div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#e9d5ff", marginTop: 34 }}>
          Completed {completions} anime this year
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", height: 4, width: "100%", borderRadius: 4, backgroundColor: "#a855f7" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#9b8ab0" }}>
            See your full Year in Anime on ZyniVerse
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
