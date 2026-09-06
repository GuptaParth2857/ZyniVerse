import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const game = s.get("game") || "Quiz";
  const score = s.get("score") || "";
  const total = s.get("total");
  const streak = s.get("streak");
  const label = s.get("label") || "ZyniVerse Daily";
  const sub = s.get("sub");
  const user = s.get("user") || "An Otaku on ZyniVerse";

  const scoreStr = streak ? `${score} 🔥${streak}` : score;

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
          backgroundImage: "linear-gradient(135deg, #14091f 0%, #1d1030 50%, #0b0614 100%)",
          padding: "56px 80px",
          color: "#f5f2fa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            backgroundColor: "rgba(168,85,247,0.14)",
            border: "1px solid rgba(168,85,247,0.5)",
            borderRadius: 999,
            padding: "14px 30px",
            fontSize: 34,
            fontWeight: 800,
            color: "#d8b4fe",
            letterSpacing: 2,
          }}
        >
          {game} • {label}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 900,
            color: "#ffffff",
            marginTop: 46,
          }}
        >
          {scoreStr}
        </div>
        {total ? (
          <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: "#9b8ab0", marginTop: 18 }}>
            out of {total}
          </div>
        ) : sub ? (
          <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: "#9b8ab0", marginTop: 18 }}>{sub}</div>
        ) : null}

        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#c4b5fd", marginTop: 54 }}>
          {user}
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", height: 4, width: "100%", borderRadius: 4, backgroundColor: "#a855f7" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#9b8ab0" }}>
            Think you can beat me? Try it on zyverse.in
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