import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: "noindex" };

const ANITALY_BASE = "https://anitally.in/api";
const MYDUBLIST_URL =
  "https://raw.githubusercontent.com/Joelis57/MyDubList/main/dubs/confidence/normal/dubbed_english.json";

const LANG_CONFIG: Record<string, { label: string; color: string }> = {
  Hindi: { label: "हिन्दी", color: "#ff9933" },
  Tamil: { label: "தமிழ்", color: "#e03c31" },
  Telugu: { label: "తెలుగు", color: "#ffd700" },
  English: { label: "English", color: "#29f2e0" },
};

export default async function DubEmbedPage({
  params,
}: {
  params: Promise<{ malId: string }>;
}) {
  const { malId } = await params;
  const malIdNum = Number(malId);
  if (isNaN(malIdNum)) notFound();

  let available: string[] = [];

  try {
    const [regionalRes, englishRes] = await Promise.all([
      fetch(`${ANITALY_BASE}/regional-dubs`, { signal: AbortSignal.timeout(5000) }),
      fetch(MYDUBLIST_URL, { signal: AbortSignal.timeout(5000) }),
    ]);

    const regionalData = regionalRes.ok ? await regionalRes.json() : null;
    const englishData = englishRes.ok ? await englishRes.json() : null;
    const englishDubIds = englishData?.dubbed
      ? new Set<number>(englishData.dubbed)
      : new Set<number>();

    const match = regionalData?.data?.find(
      (item: any) => item.mal_id === malIdNum
    );

    if (match) {
      const langs: string[] = [];
      if (match.has_hindi) langs.push("Hindi");
      if (match.has_tamil) langs.push("Tamil");
      if (match.has_telugu) langs.push("Telugu");
      available = langs;
    }

    if (englishDubIds.has(malIdNum)) {
      available.push("English");
    }
  } catch {
    // graceful fallback
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 0",
            flexWrap: "wrap",
          }}
        >
          {available.length === 0 ? (
            <span style={{ color: "#807ba3", fontSize: 12 }}>
              No dubs available
            </span>
          ) : (
            available.map((lang) => {
              const cfg = LANG_CONFIG[lang] || { label: lang, color: "#807ba3" };
              return (
                <span
                  key={lang}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 8px",
                    borderRadius: 20,
                    border: `1px solid ${cfg.color}40`,
                    background: `${cfg.color}15`,
                    color: cfg.color,
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {cfg.label}
                </span>
              );
            })
          )}
        </div>
      </body>
    </html>
  );
}
