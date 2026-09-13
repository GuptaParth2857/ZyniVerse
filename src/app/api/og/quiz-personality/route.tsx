import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { PERSONALITIES, type PersonalityKey } from "@/lib/quiz-personality";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const key = (s.get("a") || "").toLowerCase() as PersonalityKey;
  const p = PERSONALITIES[key] || PERSONALITIES.naruto;
  const n = s.get("n");

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
          backgroundImage: `linear-gradient(150deg, ${p.from} 0%, #14091f 52%, #0b0614 100%)`,
          padding: "60px 90px",
          color: "#f5f2fa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: "rgba(255,255,255,0.07)",
            border: `1px solid ${p.accent}55`,
            borderRadius: 999,
            padding: "12px 26px",
            fontSize: 28,
            fontWeight: 800,
            color: "#d8b4fe",
            letterSpacing: 3,
          }}
        >
          🎭 ZYNIVERSE · ANIME PERSONALITY TEST
        </div>

        <div style={{ display: "flex", fontSize: 92, marginTop: 34 }}>{p.emoji}</div>

        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: 4,
            marginTop: 10,
            color: p.accent,
          }}
        >
          {p.name}
        </div>

        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#ffffff", marginTop: 8 }}>
          Tumhara anime personality hai — {p.anime} ke style me
        </div>

        <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: "#c7b7ff", marginTop: 14, textAlign: "center" }}>
          “{p.line}”
        </div>

        {n ? (
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#9b8ab0", marginTop: 20 }}>— {n}</div>
        ) : null}

        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", height: 4, width: "100%", borderRadius: 4, backgroundColor: p.accent }} />
          <div style={{ display: "flex", fontSize: 26, color: "#9b8ab0" }}>
            Apna personality check karo → zyverse.in/quiz/personality
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