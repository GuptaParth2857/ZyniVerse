import type { Metadata } from "next";
import ConventionCalendar from "@/components/ConventionCalendar";
import ConventionMap from "@/components/ConventionMap";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Conventions India 2026 — Comic Con, Events & Meetups Calendar | ZyniVerse",
  description:
    "Complete calendar of anime conventions, comic cons, and otaku events in India for 2026. Comic Con Hyderabad, Comic Con Delhi, Anime Events Bangalore, Mumbai, Chennai, and more. Ticket info, dates, and venues.",
  keywords: [
    "anime conventions india 2026", "comic con hyderabad 2026", "comic con delhi 2026",
    "anime events in bangalore 2026", "anime events india", "comic con india",
    "otaku events india", "anime meetup india", "manga events india",
    "comic con mumbai 2026", "anime convention chennai", "anime expo india",
  ],
  openGraph: {
    title: "Anime Conventions India 2026 — Complete Calendar | ZyniVerse",
    description: "Find every anime convention, comic con, and otaku event in India for 2026. Dates, venues, and ticket info.",
    url: `${BASE_URL}/conventions`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anime Conventions India 2026 — ZyniVerse",
    description: "Complete calendar of anime conventions and comic cons across India for 2026.",
  },
  alternates: {
    canonical: `${BASE_URL}/conventions`,
  },
  robots: { index: true, follow: true },
};

export default function ConventionsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#050510]" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 120px 40px rgba(0,0,0,0.6)" }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ffe0]">
            Events
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-4xl font-bold sm:text-5xl mt-2 bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-transparent">
              Anime Conventions in India
            </h1>
          </div>
          <p className="mt-3 text-sm max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
            Find anime conventions, comic cons, and otaku events near you. Upcoming events, ticket info, and community meetups across India.
          </p>
        </div>

        <div className="mb-16">
          <ConventionCalendar />
        </div>

        <div className="border-t border-[rgba(0,255,224,0.06)] pt-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-white">Conventions by Location</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Browse conventions grouped by state and city</p>
          </div>
          <ConventionMap />
        </div>

        <p className="mt-10 text-center font-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.06)" }}>
          ZYNIVERSE • v2.4.1 • ENCRYPTED
        </p>
      </div>
    </div>
  );
}
