import Link from "next/link";

const features = [
  {
    icon: "🗺️",
    title: "Watch Order",
    desc: "40+ curated franchise guides",
    link: "/watch-order",
    color: "#29f2e0",
  },
  {
    icon: "⏭️",
    title: "Filler Guide",
    desc: "Community-voted canon tracker",
    link: "/filler",
    color: "#ff2d78",
  },
  {
    icon: "📺",
    title: "Indian TV Schedule",
    desc: "20+ channels, live timings",
    link: "/tv-schedule",
    color: "#8b5cf6",
  },
  {
    icon: "🇮🇳",
    title: "Hindi / Tamil / Telugu",
    desc: "Indian dub tracking",
    link: "/dubbed?language=hindi",
    color: "#ff9933",
  },
  {
    icon: "🏆",
    title: "Anime Challenges",
    desc: "Join seasonal & yearly",
    link: "/challenges",
    color: "#ff2d78",
  },
  {
    icon: "📸",
    title: "Cosplay Gallery",
    desc: "Upload & explore",
    link: "/cosplay",
    color: "#29f2e0",
  },
];

export default function WhyZyniVerse() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">
          ⚡ Why ZyniVerse?
        </p>
        <h2 className="font-display text-2xl font-bold sm:text-3xl mt-1">
          Not just another anime list.
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const gradient = `conic-gradient(from var(--border-angle), ${f.color}, #ff2d78, #8b5cf6, #29f2e0, ${f.color})`;
          return (
            <Link key={f.link} href={f.link} className="neon-feature-card group">
              {/* Animated RGB border */}
              <div
                className="neon-border rounded-2xl"
                style={{ background: gradient }}
              />
              {/* Glow on hover */}
              <div
                className="neon-glow rounded-2xl"
                style={{ background: gradient }}
              />
              {/* Inner card */}
              <div className="neon-inner rounded-2xl">
                <span className="text-3xl block mb-3">{f.icon}</span>
                <p
                  className="font-display text-lg font-bold"
                  style={{ color: f.color }}
                >
                  {f.title}
                </p>
                <p className="text-sm text-[var(--color-mute)] mt-1.5">
                  {f.desc}
                </p>
                {/* Arrow */}
                <span
                  className="neon-arrow absolute top-6 right-6 text-lg opacity-0 transition-all duration-300"
                  style={{ color: f.color }}
                >
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
