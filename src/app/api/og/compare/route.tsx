import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const u1 = s.get("u1") || "You";
  const u2 = s.get("u2") || "Them";
  const pct = s.get("pct") || "0";

  function label(v: number): string {
    if (v >= 85) return "Anime Soulmates";
    if (v >= 70) return "Great Match";
    if (v >= 50) return "Good Friends";
    if (v >= 30) return "Different Worlds";
    return "Total Opposites";
  }
  const n = parseInt(pct, 10) || 0;
  const tag = label(n);
  const color = n >= 70 ? "#29f2e0" : n >= 40 ? "#f5d000" : "#ff2d78";

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
          backgroundImage: "linear-gradient(135deg, #101a2b 0%, #1d1030 50%, #0b0614 100%)",
          padding: "56px 80px",
          color: "#f5f2fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#d8b4fe", letterSpacing: 3 }}>
          💞 Anime Compatibility
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 34,
            background: "rgba(41,242,224,0.06)",
            border: `1px solid ${color}66`,
            borderRadius: 40,
            padding: "26px 70px",
          }}
        >
          <div style={{ display: "flex", fontSize: 150, fontWeight: 900, color }}>{pct}%</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#ffffff", marginTop: 6 }}>{tag}</div>
        </div>

        <div style={{ display: "flex", fontSize: 42, fontWeight: 600, color: "#e9d5ff", marginTop: 40, gap: 20, alignItems: "center" }}>
          <span>{u1}</span>
          <span style={{ color: "#6b7280" }}>×</span>
          <span>{u2}</span>
        </div>

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", height: 4, width: "100%", borderRadius: 4, backgroundColor: "#a855f7" }} />
          <div style={{ display: "flex", fontSize: 26, color: "#9b8ab0" }}>
            Check your anime match on ZyniVerse
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