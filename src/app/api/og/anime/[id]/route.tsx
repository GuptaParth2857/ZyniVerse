import { ImageResponse } from "next/og";
import { getMediaBatch, bestTitle } from "@/lib/anilist";

const BRAND = "#a855f7";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let media = null;
  try {
    const batch = await getMediaBatch([Number(id)]);
    media = batch[0] ?? null;
  } catch {
    media = null;
  }

  if (!media || !Number.isFinite(Number(id))) {
    return new Response("Not found", { status: 404 });
  }

  const title = bestTitle(media.title);
  const cover =
    media.coverImage?.extraLarge || media.coverImage?.large || null;
  const score = media.averageScore ? (media.averageScore / 10).toFixed(1) : null;
  const genres = (media.genres || []).slice(0, 3);
  const metaBits = [
    media.format,
    media.episodes ? `${media.episodes} ep` : null,
    media.season ? `${titleCase(media.season)}` : media.status === "RELEASING" ? "Airing" : null,
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0b0614",
          backgroundImage: `linear-gradient(135deg, #14091f 0%, ${hexWithAlpha(media.coverImage?.color) || "#1d1030"} 100%)`,
        }}
      >
        {/* Cover art */}
        <div style={{ display: "flex", position: "relative", width: 430, height: 630, flexShrink: 0 }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              width={430}
              height={630}
              style={{ objectFit: "cover", width: 430, height: 630 }}
            />
          ) : (
            <div style={{ width: 430, height: 630, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, color: "#3f2d5c" }}>
              ★
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: 90,
              display: "flex",
              backgroundImage: "linear-gradient(to left, #0b0614, rgba(11,6,20,0))",
            }}
          />
        </div>

        {/* Info panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "52px 56px 44px",
            color: "#f5f2fa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(168,85,247,0.14)",
                border: "1px solid rgba(168,85,247,0.45)",
                borderRadius: 999,
                padding: "10px 22px",
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 700, color: "#d8b4fe", letterSpacing: 1 }}>ZyniVerse</span>
            </div>
            {score ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginLeft: 18,
                  backgroundColor: "rgba(250,204,21,0.12)",
                  border: "1px solid rgba(250,204,21,0.4)",
                  borderRadius: 999,
                  padding: "10px 20px",
                }}
              >
                <span style={{ fontSize: 24, color: "#facc15" }}>★</span>
                <span style={{ fontSize: 26, fontWeight: 700, color: "#fde68a" }}>{score}</span>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: title.length > 42 ? 54 : 68,
              fontWeight: 800,
              lineHeight: 1.15,
              maxHeight: 240,
              overflow: "hidden",
            }}
          >
            {title}
          </div>

          {metaBits.length > 0 ? (
            <div style={{ display: "flex", gap: 14, marginTop: 26 }}>
              {metaBits.map((m) => (
                <span key={m} style={{ fontSize: 25, color: "#c4b5fd" }}>
                  {m}
                </span>
              ))}
            </div>
          ) : null}

          {genres.length > 0 ? (
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              {genres.map((g) => (
                <span
                  key={g}
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#e9d5ff",
                    backgroundColor: "rgba(139,92,246,0.18)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    borderRadius: 10,
                    padding: "8px 16px",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          ) : null}

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", height: 3, width: "100%", borderRadius: 3, backgroundColor: BRAND }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <span style={{ fontSize: 23, color: "#9b8ab0" }}>Skip filler • Watch order • Indian dubs</span>
              <span style={{ fontSize: 23, color: "#9b8ab0" }}>zyverse.in/anime/{media.id}</span>
            </div>
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

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** AniList colors are hex like "#e0a3c7" — soften into a usable bg stop. */
function hexWithAlpha(hex?: string | null): string | null {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
  return `${hex}33`;
}
