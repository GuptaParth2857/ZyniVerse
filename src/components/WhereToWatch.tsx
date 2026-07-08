import { getStreamingSources, type StreamingSource } from "@/lib/streaming";
import { getAnimeStreamingPlatforms, type Platform } from "@/lib/platforms";
import { getAffiliateLink } from "@/lib/affiliate";

interface WhereToWatchProps {
  streamingLinks: { site: string; url: string }[];
  title?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Crunchyroll: "#F47521",
  Netflix: "#E50914",
  "Prime Video": "#00A8E1",
  JioHotstar: "#1A1A2E",
  "Disney+ Hotstar": "#113CC2",
  "Muse Asia": "#FF0000",
  "Sony LIV": "#8B4513",
  "Amazon Prime Video": "#00A8E1",
};

const TYPE_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  subscription: { label: "SUB", bg: "#3b82f622", text: "#3b82f6" },
  free: { label: "FREE", bg: "#22c55e22", text: "#22c55e" },
  ads: { label: "ADS", bg: "#f9731622", text: "#f97316" },
};

const LANG_STYLES: Record<string, { bg: string; text: string }> = {
  Hindi: { bg: "#ff993322", text: "#ff9933" },
  English: { bg: "#3b82f622", text: "#3b82f6" },
  Japanese: { bg: "#a855f722", text: "#a855f7" },
};

function getAffiliateUrl(source: StreamingSource): string {
  const name = source.name.toLowerCase();
  if (name.includes("crunchyroll")) {
    try {
      const url = new URL(source.url);
      url.searchParams.set("ref", "zyniverse");
      return url.toString();
    } catch { return source.url; }
  }
  if (name.includes("amazon") || name.includes("prime")) {
    try {
      const url = new URL(source.url);
      url.searchParams.set("tag", "zyniverse-21");
      return url.toString();
    } catch { return source.url; }
  }
  return source.url;
}

function StreamingCard({ source }: { source: StreamingSource }) {
  const color = PLATFORM_COLORS[source.name] || "#888";
  const typeStyle = TYPE_STYLES[source.type] || TYPE_STYLES.subscription;
  const href = getAffiliateUrl(source);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex shrink-0 flex-col gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-cyan)]/40 transition-all w-[200px]"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {source.name === "Crunchyroll" ? "CR" :
           source.name === "Netflix" ? "N" :
           source.name === "Amazon Prime Video" || source.name === "Prime Video" ? "PV" :
           source.name === "JioHotstar" ? "JH" :
           source.name === "Disney+ Hotstar" ? "DH" :
           source.name === "Muse Asia" ? "MA" :
           source.name === "Sony LIV" ? "SL" :
           source.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-[var(--color-ink)] group-hover:text-[var(--color-cyan)] transition-colors">
            {source.name}
          </p>
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mt-0.5"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {typeStyle.label}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] ml-auto shrink-0">
          <path d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      </div>

      {source.languages.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {source.languages.map((lang) => {
            const ls = LANG_STYLES[lang] || { bg: "#88888822", text: "#888888" };
            return (
              <span
                key={lang}
                className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide"
                style={{ backgroundColor: ls.bg, color: ls.text, border: `1px solid ${ls.bg.replace("22", "44")}` }}
              >
                {lang}
              </span>
            );
          })}
        </div>
      )}
    </a>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
      style={{ background: platform.color }}
    >
      {platform.name === "Crunchyroll" ? "CR" :
       platform.name === "Netflix" ? "N" :
       platform.name === "Amazon Prime Video" ? "PV" :
       platform.name === "Disney+" ? "D+" :
       platform.name === "Hulu" ? "H" :
       platform.name === "Funimation" ? "F" :
       platform.name === "HIDIVE" ? "HD" :
       platform.name === "YouTube" ? "YT" :
       platform.name === "Apple TV" ? "AT" :
       platform.name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function WhereToWatch({ streamingLinks, title }: WhereToWatchProps) {
  const curatedSources = title ? getStreamingSources(title) : [];

  if (curatedSources.length > 0) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
          Where to Watch
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-line)]">
          {curatedSources.map((source, i) => (
            <StreamingCard key={`${source.name}-${i}`} source={source} />
          ))}
        </div>
      </div>
    );
  }

  const platforms = getAnimeStreamingPlatforms(streamingLinks);
  if (platforms.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
        Where to Watch
      </h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map(({ platform, url }) => {
          const isAffiliate = platform.id === "crunchyroll" || platform.id === "prime";
          const affiliateUrl = isAffiliate
            ? getAffiliateLink(platform.id === "prime" ? "amazon" : platform.id, url.replace(/^https?:\/\/[^\/]+/, ""))
            : url;
          return (
          <a
            key={platform.id}
            href={affiliateUrl}
            target="_blank"
            rel={isAffiliate ? "noopener noreferrer sponsored" : "noopener noreferrer"}
            className="group flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm hover:border-[var(--color-cyan)]/40 transition-all"
          >
            <PlatformBadge platform={platform} />
            <span className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-cyan)] transition-colors">
              {platform.name}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] ml-auto">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </a>
        );
      })}
      </div>
    </div>
  );
}
