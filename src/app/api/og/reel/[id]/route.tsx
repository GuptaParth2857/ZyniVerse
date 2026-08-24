import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let reel = null;
  try {
    reel = await prisma.reel.findUnique({
      where: { id },
      select: {
        caption: true,
        thumbnailUrl: true,
        views: true,
        createdAt: true,
        user: { select: { username: true, avatar: true } },
      },
    });
  } catch {
    reel = null;
  }

  if (!reel) {
    return new Response("Not found", { status: 404 });
  }

  const username = reel.user?.username || "anonymous";
  const caption =
    (reel.caption || "").replace(/<[^>]*>/g, "").slice(0, 140) ||
    "Watch this anime reel on ZyniVerse";
  const thumb = reel.thumbnailUrl || null;
  const views = reel.views > 0 ? `${formatViews(reel.views)} views` : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#12081d",
        }}
      >
        {/* Background thumbnail */}
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            width={1200}
            height={630}
            style={{ objectFit: "cover", width: 1200, height: 630, position: "absolute", top: 0, left: 0 }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              display: "flex",
              backgroundImage: "linear-gradient(135deg, #1d1030 0%, #3b1355 60%, #581c87 100%)",
            }}
          />
        )}

        {/* Dark gradient overlay bottom-up */}
        <div
          style={{
            position: "absolute",
            top: 250,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage: "linear-gradient(to top, rgba(7,3,12,0.96) 20%, rgba(7,3,12,0))",
          }}
        />

        {/* Content column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: "44px 52px 40px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                backgroundColor: "rgba(168,85,247,0.2)",
                border: "1px solid rgba(168,85,247,0.55)",
                borderRadius: 999,
                padding: "10px 22px",
              }}
            >
              <span style={{ fontSize: 26, fontWeight: 700, color: "#e9d5ff" }}>ZyniVerse</span>
            </div>
            {views ? (
              <span style={{ fontSize: 24, color: "#cbb8dd", backgroundColor: "rgba(7,3,12,0.55)", borderRadius: 999, padding: "10px 18px", display: "flex" }}>
                {views}
              </span>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {reel.user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reel.user.avatar}
                  alt=""
                  width={64}
                  height={64}
                  style={{ objectFit: "cover", width: 64, height: 64, borderRadius: 999, border: "2px solid #a855f7" }}
                />
              ) : null}
              <span style={{ fontSize: 32, fontWeight: 700, color: "#f3e8ff", display: "flex" }}>
                @{username}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: caption.length > 80 ? 40 : 48,
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.25,
                maxHeight: 130,
                overflow: "hidden",
              }}
            >
              {caption}
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

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
