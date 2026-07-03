import { getAnimeStreamingPlatforms, type Platform } from "@/lib/platforms";

interface WhereToWatchProps {
  streamingLinks: { site: string; url: string }[];
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

export default function WhereToWatch({ streamingLinks }: WhereToWatchProps) {
  const platforms = getAnimeStreamingPlatforms(streamingLinks);
  if (platforms.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-base font-bold mb-4 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
        Where to Watch
      </h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map(({ platform, url }) => (
          <a
            key={platform.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
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
        ))}
      </div>
    </div>
  );
}
