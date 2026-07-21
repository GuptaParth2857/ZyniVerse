import Link from "next/link";

export default function NeonBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="neon-card neon-banner-card">
        <div className="relative z-10 flex flex-col items-center gap-5 px-6 py-8 text-center sm:px-10 sm:py-10">
          {/* Heading */}
          <h2 className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
            <span className="neon-text-gradient">The Ultimate Anime Companion</span>
          </h2>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--color-mute)]">
            <span className="feature-pill">Skip Filler</span>
            <span className="feature-dot">•</span>
            <span className="feature-pill">Watch in the Right Order</span>
            <span className="feature-dot">•</span>
            <span className="feature-pill">Track Indian TV &amp; Dubs</span>
            <span className="feature-dot">•</span>
            <span className="feature-pill">Discover Your Next Favorite Anime</span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-[var(--color-cyan)]">
            <span>200+ Anime</span>
            <span className="text-[var(--color-line)]">|</span>
            <span>39 Watch Orders</span>
            <span className="text-[var(--color-line)]">|</span>
            <span>Filler Guides</span>
            <span className="text-[var(--color-line)]">|</span>
            <span>Cosplay</span>
            <span className="text-[var(--color-line)]">|</span>
            <span>Challenges</span>
          </div>

          {/* CTA */}
          <Link
            href="/search"
            className="neon-banner-btn group relative mt-1 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
          >
            <span className="relative z-10">Explore Now</span>
            <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
