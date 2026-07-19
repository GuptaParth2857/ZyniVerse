import { getFillerForAnime } from "@/lib/filler";
import { getAnimeDetailFull } from "@/lib/anilist";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: "noindex" };

export default async function FillerEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anilistId = Number(id);
  if (isNaN(anilistId)) notFound();

  const [anime, filler] = await Promise.all([
    getAnimeDetailFull(anilistId).catch(() => null),
    getFillerForAnime(anilistId),
  ]);

  const _title = anime?.title?.english || anime?.title?.romaji || "Anime";

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0a0f",
          color: "#f0eef8",
          fontFamily: "Inter, sans-serif",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        {!filler ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              color: "#807ba3",
              fontSize: "14px",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            No filler data found
          </div>
        ) : (
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#807ba3",
                  fontFamily: "JetBrains Mono, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  marginBottom: 2,
                }}
              >
                Filler Guide
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {filler.title}
              </h1>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              <StatBox label="Filler" value={`${filler.fillerPercent}%`} color="#ff2d78" />
              <StatBox label="Canon" value={`${100 - filler.fillerPercent}%`} color="#29f2e0" />
              <StatBox label="Mixed" value={`${filler.mixed}`} color="#ffb020" />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                fontSize: 11,
                color: "#807ba3",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "#29f2e0" }}>{filler.mangaCanon}</div>
                <div>Manga Canon</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#ffb020" }}>{filler.animeCanon}</div>
                <div>Anime Canon</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#8a5cff" }}>{filler.total}</div>
                <div>Total Ep</div>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #1f1d33",
                paddingTop: 8,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#807ba3",
                  fontFamily: "JetBrains Mono, monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 6,
                }}
              >
                Episode Breakdown
              </div>
              {["filler", "mixed-manga", "anime-canon", "manga-canon"].map((type) => {
                const eps = filler.quickList[type];
                if (!eps || eps.length === 0) return null;
                return (
                  <div key={type} style={{ marginBottom: 4, fontSize: 11, display: "flex", gap: 6 }}>
                    <span
                      style={{
                        color: "#807ba3",
                        fontFamily: "JetBrains Mono, monospace",
                        minWidth: 60,
                        textTransform: "capitalize",
                      }}
                    >
                      {type.replace("-", " ")}:
                    </span>
                    <span style={{ color: "#f0eef8" }}>{eps.join(", ")}</span>
                  </div>
                );
              })}
            </div>

            <a
              href={`https://zyverse.in/anime/${anilistId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 8,
                background: "rgba(41,242,224,0.1)",
                color: "#29f2e0",
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View on ZyniVerse →
            </a>
          </div>
        )}
      </body>
    </html>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "rgba(18,17,30,0.8)",
        border: "1px solid #1f1d33",
        borderRadius: 8,
        padding: "8px 4px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "JetBrains Mono, monospace" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "#807ba3", marginTop: 2 }}>{label}</div>
    </div>
  );
}
