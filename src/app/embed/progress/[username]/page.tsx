import { getAnimeListFromAniList, bestTitle } from "@/lib/anilist";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: "noindex" };

export default async function ProgressEmbedPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!username.trim()) notFound();

  let entries: Awaited<ReturnType<typeof getAnimeListFromAniList>> = [];
  try {
    entries = await getAnimeListFromAniList(username);
  } catch {
    notFound();
  }

  const watching = entries
    .filter((e) => e.status === "CURRENT")
    .slice(0, 5);

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
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {watching.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              color: "#807ba3",
              fontSize: 14,
              flexDirection: "column",
              gap: 8,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            No currently watching
          </div>
        ) : (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 11,
                color: "#807ba3",
                fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
              }}
            >
              {username} &mdash; Currently Watching
            </div>

            {watching.map((entry) => {
              const progress = entry.progress || 0;
              const total = entry.media?.episodes || progress || 100;
              const pct = Math.min(100, Math.round((progress / total) * 100));

              return (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #1f1d33",
                    background: "rgba(18,17,30,0.6)",
                  }}
                >
                  {entry.media?.coverImage?.large && (
                    <img
                      src={entry.media.coverImage.large}
                      alt=""
                      style={{
                        width: 32,
                        height: 44,
                        borderRadius: 4,
                        objectFit: "cover",
                        border: "1px solid #1f1d33",
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {bestTitle(entry.media?.title)}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        height: 4,
                        borderRadius: 2,
                        background: "#1f1d33",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 2,
                          background: "#29f2e0",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#807ba3",
                        marginTop: 2,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {progress} / {total || "?"} ep
                    </div>
                  </div>
                </div>
              );
            })}

            <a
              href={`https://zyverse.in/profile/${encodeURIComponent(username)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                padding: "6px 0",
                borderRadius: 8,
                color: "#807ba3",
                fontSize: 11,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              View full profile on ZyniVerse →
            </a>
          </div>
        )}
      </body>
    </html>
  );
}
