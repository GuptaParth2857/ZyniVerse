"use client";

import { useState, useEffect } from "react";
import { getAiringSchedule, bestTitle } from "@/lib/anilist";

export default function ScheduleEmbedPage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    getAiringSchedule(now, now + 86400)
      .then(setSchedule)
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (ts: number) =>
    new Date(ts * 1000).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`.embed-link:hover{background:rgba(41,242,224,0.05)}`}</style>
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
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 11,
              color: "#807ba3",
              fontFamily: "JetBrains Mono, monospace",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 4,
            }}
          >
            Airing Today
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "#807ba3",
                fontSize: 13,
              }}
            >
              Loading...
            </div>
          ) : schedule.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "#807ba3",
                fontSize: 13,
              }}
            >
              Nothing airing today
            </div>
          ) : (
            schedule.slice(0, 15).map((item: any) => (
              <a
                key={item.id}
                href={`https://zyniverse.app/anime/${item.media.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="embed-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 8px",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {item.media.coverImage?.large && (
                  <img
                    src={item.media.coverImage.large}
                    alt=""
                    style={{
                      width: 28,
                      height: 40,
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
                    {bestTitle(item.media.title)}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#807ba3",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    Ep {item.episode} · {formatTime(item.airingAt)}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "#29f2e0",
                    fontFamily: "JetBrains Mono, monospace",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatTime(item.airingAt)}
                </span>
              </a>
            ))
          )}
        </div>
      </body>
    </html>
  );
}
