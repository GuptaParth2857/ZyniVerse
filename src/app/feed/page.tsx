import type { Metadata } from "next";
import { getUnifiedFeed } from "@/lib/feed";
import FeedClient from "@/components/FeedClient";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "My Feed",
  description:
    "Your personalized anime feed — news, memes, reels, moments, fan art, cosplay and blogs, ranked to your taste. Follow, discover and never miss a drop.",
  alternates: { canonical: "/feed" },
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ZyniVerse — anime filler guides, watch orders and dub tracking" }],
    title: "My Feed",
    description: "An anime community feed ranked to your taste — news, memes, reels, fan art and more, all in one place.",
    url: "/feed",
    type: "website",
  },
};

export default async function FeedPage() {
  // Server-render page 1 for SEO + fast first paint; FeedClient hydrates the
  // personalized/infinite-scroll behavior on top.
  const initial = await getUnifiedFeed({ mode: "foryou", limit: 20 });

  return (
    <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
        }}
      />

      {/* Header */}
      <section className="mb-8">
        <p className="console-label mb-3 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
          </span>
          Unified Feed · Ranked For You
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">My Feed</h1>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-mute)]">
            News, memes, reels, moments, fan art, cosplay, wallpapers aur blogs — sab ek jagah, tumhare follows aur
            engagement ke hisaab se sorted. 🎌
          </p>
        </div>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-[var(--color-magenta)]/40 via-[var(--color-cyan)]/30 to-transparent" />
      </section>

      <FeedClient initialItems={initial.items} />

      {/* SEO body copy */}
      <section className="mt-14">
        <h2 className="font-display text-lg font-bold text-white">What is ZyniVerse Feed?</h2>
        <p className="mt-2 max-w-3xl space-y-2 text-sm leading-relaxed text-[var(--color-mute)]">
          ZyniVerse&#39;s unified feed brings the anime community&#39;s latest activity into one place — trending news, fan
          art, cosplay, reels, memes, moments and wallpapers. The ranking algorithm combines recency, engagement and your
          entertainment patterns so the top content surfaces first. Follow creators to build a personal feed that shows
          only the posts you care about.
        </p>
      </section>
    </main>
  );
}