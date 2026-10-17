import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Site-wide default social card (og:image / twitter:image).
 *
 * This is the file-based metadata convention, and Next only applies it when the
 * route does not set `openGraph.images` in code (see
 * `mergeStaticMetadata` in next/dist/lib/metadata). That means pages with their
 * own generated cards (/anime/[id], /reels/[id], tournaments, quiz, news desk)
 * keep them, while every other route inherits this one — previously they had no
 * og:image at all, so links shared on X/WhatsApp/Reddit/Discord rendered as a
 * bare text card.
 */
export const alt = "ZyniVerse — Anime Filler Guides, Watch Orders & Indian Dubs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// `node:fs` is used below to inline the logo, and ImageResponse needs the
// Node.js runtime (same as the other /api/og/* routes in this repo).
export const runtime = "nodejs";
// Render on request instead of at build: this is a *file-convention* route, so
// by default Next would prerender it during `next build`. If satori ever fails
// there (font loading, etc.) the whole production deploy breaks over a social
// card. The existing /api/og/* routes render at runtime on Vercel and are proven,
// and the Cache-Control below keeps it on the CDN edge anyway.
export const dynamic = "force-dynamic";

function logoDataUri(): string | null {
  try {
    const buf = readFileSync(join(process.cwd(), "public", "logo.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

// Read once at module scope (predictable value, no repeat I/O per render).
const LOGO_SRC = logoDataUri();

export default async function OpengraphImage() {
  const logo = LOGO_SRC;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "#0a0a12",
          backgroundImage:
            "linear-gradient(135deg, #0a0a12 0%, #150a26 55%, #240a36 100%)",
          color: "#f5f2fa",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            display: "flex",
            backgroundImage: "linear-gradient(90deg, #d946ef 0%, #22d3ee 100%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" width={104} height={104} style={{ borderRadius: 22 }} />
          ) : null}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>ZyniVerse</span>
            <span style={{ fontSize: 26, color: "#c084fc", fontWeight: 600 }}>zyverse.in</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 54 }}>
          <span style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.14 }}>
            Anime filler guides & watch orders
          </span>
          <span style={{ fontSize: 40, fontWeight: 700, color: "#e9d5ff", marginTop: 12 }}>
            Hindi · Tamil · Telugu dub tracking
          </span>
        </div>

        <div style={{ display: "flex", flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 4, width: 300, borderRadius: 4, backgroundColor: "#d946ef" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 18 }}>
            <span style={{ fontSize: 27, color: "#a1a1aa" }}>
              Filler lists · Schedules · Manga tracker · Community
            </span>
            <span style={{ fontSize: 27, color: "#22d3ee", fontWeight: 700 }}>Free forever</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, immutable",
      },
    }
  );
}
