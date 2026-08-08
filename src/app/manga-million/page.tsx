import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MANGA MILLION: Shueisha's Free Manga Platform — Hindi & 100+ Languages | ZyniVerse",
  description:
    "MANGA MILLION is Shueisha's free manga platform with ~400 titles (One Piece, Naruto, Jujutsu Kaisen, Oshi no Ko) in 100+ languages including Hindi. No registration needed. Read for free until December 2027.",
  keywords: [
    "manga million",
    "manga million hindi",
    "shueisha manga million",
    "manga million free",
    "shueisha 100th anniversary manga",
    "hindi manga app",
    "one piece hindi manga",
    "naruto hindi manga",
    "free manga in hindi",
    "shueisha free manga",
  ],
  openGraph: {
    title: "MANGA MILLION: Shueisha's Free Manga Platform — Hindi & 100+ Languages",
    description:
      "Nearly 400 manga titles, 1 million pages, 100+ languages including Hindi — completely free with no registration. Here's everything Indian anime fans need to know.",
    type: "article",
    url: "https://zyverse.in/manga-million",
    siteName: "ZyniVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "MANGA MILLION: Shueisha's Free Manga Platform — Hindi & 100+ Languages",
    description:
      "Nearly 400 manga titles, 1 million pages, 100+ languages including Hindi — completely free with no registration.",
  },
  alternates: { canonical: "https://zyverse.in/manga-million" },
  robots: { index: true, follow: true },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

const FACTS = [
  { value: "~400", label: "Manga titles at launch" },
  { value: "1M+", label: "Pages of manga" },
  { value: "100+", label: "Languages, incl. Hindi" },
  { value: "150+", label: "Shojo titles included" },
  { value: "~300", label: "First-ever translations" },
  { value: "Free", label: "No account required" },
];

const TITLES = [
  "One Piece",
  "Naruto",
  "Bleach",
  "Demon Slayer: Kimetsu no Yaiba",
  "Jujutsu Kaisen",
  "Chainsaw Man",
  "Oshi no Ko",
  "SPY×FAMILY",
  "Hunter x Hunter",
  "JoJo's Bizarre Adventure",
  "Dr. Stone",
  "Hell's Paradise",
  "Black Clover",
  "My Hero Academia",
  "Kingdom",
  "NANA",
  "Kimi ni Todoke",
  "Look Back",
];

const LANGS = [
  "English",
  "Hindi",
  "Chinese",
  "Arabic",
  "Spanish",
  "French",
  "Turkish",
  "Tagalog",
  "Korean",
  "Polish",
];

const FAQS = [
  {
    q: "What is MANGA MILLION?",
    a: "MANGA MILLION is a digital manga platform launched by Shueisha on August 6, 2026 to mark the publisher's 100th anniversary. It offers roughly 400 manga titles — about one million pages in total — translated into more than 100 languages, free of charge.",
  },
  {
    q: "Is MANGA MILLION free in India?",
    a: "Yes. MANGA MILLION is available worldwide, including India, completely free of charge and without registration. You can read titles in Hindi and many other languages directly on the official website.",
  },
  {
    q: "Does MANGA MILLION need an account?",
    a: "No. Unlike most manga services, MANGA MILLION does not require you to create an account or log in. You can open the site and start reading immediately.",
  },
  {
    q: "Is MANGA MILLION available in Hindi?",
    a: "Yes, Hindi is among the 100+ supported languages. One Piece alone is translated into 107 languages. The exact set of languages varies by title, so check each series page on the platform.",
  },
  {
    q: "How long is MANGA MILLION available?",
    a: "MANGA MILLION is a limited-time service scheduled to remain available through the end of December 2027.",
  },
  {
    q: "Which manga can I read on MANGA MILLION?",
    a: "The lineup includes One Piece, Naruto, Bleach, Demon Slayer, Jujutsu Kaisen, Chainsaw Man, Oshi no Ko, SPY×FAMILY, Hunter x Hunter, JoJo's Bizarre Adventure, Dr. Stone, Hell's Paradise, Black Clover, My Hero Academia, Kingdom, and over 150 shojo titles such as NANA and Kimi ni Todoke.",
  },
  {
    q: "Are the MANGA MILLION translations made by AI?",
    a: "No. Shueisha's MANGA Plus Editor-in-Chief Shuhei Hosono confirmed that no AI was used in the translation process — all translations were produced by professional translators.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",
      headline: "MANGA MILLION: Shueisha's Free Manga Platform — 1 Million Pages in 100+ Languages Including Hindi",
      description:
        "Shueisha launched MANGA MILLION on August 6, 2026 — a free, no-registration manga platform with ~400 titles in 100+ languages including Hindi, available until December 2027.",
      url: `${BASE_URL}/manga-million`,
      datePublished: "2026-08-06",
      dateModified: "2026-08-06",
      author: { "@type": "Organization", name: "ZyniVerse", url: BASE_URL },
      publisher: {
        "@type": "Organization",
        name: "ZyniVerse",
        url: BASE_URL,
        logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
      },
      mainEntityOfPage: `${BASE_URL}/manga-million`,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function MangaMillionPage() {
  const updated = "August 6, 2026";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-[var(--color-cyan)] transition-colors">News</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">MANGA MILLION</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Breaking · Shueisha · Updated {updated}
          </p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              MANGA MILLION: Shueisha&apos;s Free Manga Platform
            </h1>
          </div>
          <p className="mt-4 max-w-3xl text-lg text-[var(--color-mute)] leading-relaxed">
            Shueisha just launched <strong className="text-[var(--color-ink)]">MANGA MILLION</strong> — a free
            digital platform with nearly <strong className="text-[var(--color-ink)]">400 manga titles</strong>{" "}
            (about <strong className="text-[var(--color-ink)]">one million pages</strong>) translated into{" "}
            <strong className="text-[var(--color-ink)]">over 100 languages including Hindi</strong>. No account.
            No registration. Just read.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://mangamillion.shueisha.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black hover:opacity-90 transition-opacity"
            >
              Visit MANGA MILLION →
            </a>
            <Link href="/search?q=one%20piece" className="rounded-full neon-rgb-border px-5 py-2.5 text-xs font-semibold transition-colors">
              Track These Anime on ZyniVerse →
            </Link>
            <Link href="/manga" className="rounded-full neon-rgb-border px-5 py-2.5 text-xs font-semibold transition-colors">
              Browse Manga Database →
            </Link>
          </div>
        </div>

        {/* Facts */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FACTS.map((f) => (
            <div key={f.label} className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-4 text-center">
              <p className="font-mono text-2xl font-bold text-[var(--color-ink)]">{f.value}</p>
              <p className="text-xs text-[var(--color-mute)] mt-1 leading-tight">{f.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* What */}
            <section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold mb-3">What is MANGA MILLION?</h2>
              <p className="text-sm text-[var(--color-mute)] leading-relaxed mb-3">
                MANGA MILLION is Shueisha&apos;s 100th-anniversary project and one of the largest official manga
                localization efforts ever attempted. At launch (August 6, 2026) it carries approximately{" "}
                <strong className="text-[var(--color-ink)]">400 manga titles</strong> — including One Piece, Naruto,
                Bleach, Demon Slayer, Jujutsu Kaisen, Chainsaw Man, Oshi no Ko, SPY×FAMILY, Hunter x Hunter and more —
                spanning roughly <strong className="text-[var(--color-ink)]">one million pages</strong>.
              </p>
              <p className="text-sm text-[var(--color-mute)] leading-relaxed mb-3">
                Nearly <strong className="text-[var(--color-ink)]">300 titles are receiving their first-ever official
                translation</strong>, and 50 works were translated into multiple languages specifically for this
                project. Shueisha confirmed all translations were done by professional translators —{" "}
                <strong className="text-[var(--color-ink)]">no AI was used</strong>.
              </p>
              <p className="text-sm text-[var(--color-mute)] leading-relaxed">
                The service is <strong className="text-green-400">completely free and requires no registration</strong>,
                available worldwide for a limited time — currently scheduled through the end of December 2027.
              </p>
            </section>

            {/* India */}
            <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2">
                <span>🇮🇳</span> Why it matters for Indian manga fans
              </h2>
              <ul className="space-y-3 text-sm text-[var(--color-mute)] leading-relaxed">
                <li>
                  <strong className="text-[var(--color-ink)]">Hindi is included:</strong> Hindi is among the 100+
                  languages on the platform. One Piece alone is available in 107 languages. Official-quality Hindi
                  manga from Shueisha directly — a first for many Indian readers.
                </li>
                <li>
                  <strong className="text-[var(--color-ink)]">No sign-up barrier:</strong> Most manga apps require an
                  account. MANGA MILLION lets you open the site and read instantly — great for Indian users who want
                  zero-friction access.
                </li>
                <li>
                  <strong className="text-[var(--color-ink)]">Regional reach:</strong> The language list spans beyond
                  English, meaning readers across India can finally read officially translated versions of classic
                  series.
                </li>
                <li>
                  <strong className="text-[var(--color-ink)]">Free and legal:</strong> It is the official platform, so
                  you support creators instead of relying on scanlation sites.
                </li>
              </ul>
            </section>

            {/* How */}
            <section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold mb-3">How to start reading</h2>
              <ol className="space-y-3 text-sm text-[var(--color-mute)] leading-relaxed list-none">
                {[
                  "Open mangamillion.shueisha.co.jp in a recent version of Chrome, Edge, Safari or Firefox (mobile apps exist for iOS/iPadOS and Android).",
                  "Pick any of the ~400 titles — or filter by the shojo, shonen, and seinen collections.",
                  "Select your language. One Piece supports up to 107 languages; others vary by title.",
                  "Start reading — no account, no payment, no limits. Free until the end of 2027.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-magenta)]/15 font-mono text-xs font-bold text-[var(--color-magenta)]">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* FAQ */}
            <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold mb-4">MANGA MILLION FAQ</h2>
              <div className="space-y-4">
                {FAQS.map((f) => (
                  <div key={f.q}>
                    <h3 className="text-sm font-bold text-[var(--color-ink)]">{f.q}</h3>
                    <p className="mt-1 text-sm text-[var(--color-mute)] leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
              <h2 className="font-display text-lg font-bold mb-3">Confirmed titles</h2>
              <p className="text-xs text-[var(--color-mute)] mb-3">
                Hits and fan favourites included at launch:
              </p>
              <div className="flex flex-wrap gap-2">
                {TITLES.map((t) => (
                  <Link
                    key={t}
                    href={`/search?q=${encodeURIComponent(t)}`}
                    className="rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 px-3 py-1.5 text-xs font-medium text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/10 transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
              <h2 className="font-display text-lg font-bold mb-3">Shojo spotlight</h2>
              <p className="text-sm text-[var(--color-mute)] leading-relaxed">
                More than <strong className="text-[var(--color-ink)]">150 of the titles are shojo manga</strong> —
                including classics like <strong className="text-[var(--color-ink)]">NANA</strong> and{" "}
                <strong className="text-[var(--color-ink)]">Kimi ni Todoke</strong> — one of the largest officially
                translated shojo collections ever offered internationally.
              </p>
            </section>

            <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
              <h2 className="font-display text-lg font-bold mb-3">Languages at launch</h2>
              <div className="flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <span key={l} className="rounded-full bg-[var(--color-void)] border border-[var(--color-line)] px-3 py-1 text-[11px] text-[var(--color-mute)]">
                    {l}
                  </span>
                ))}
                <span className="rounded-full bg-[var(--color-void)] border border-[var(--color-line)] px-3 py-1 text-[11px] text-[var(--color-mute)]">+ many more</span>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 text-center">
              <p className="font-display text-lg font-bold">Explore more on ZyniVerse</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/news" className="rounded-full bg-[var(--color-magenta)] px-5 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity">
                  Latest Anime News →
                </Link>
                <Link href="/manga" className="rounded-full neon-rgb-border px-5 py-2 text-xs font-semibold transition-colors">
                  Manga Database →
                </Link>
                <Link href="/filler" className="rounded-full neon-rgb-border px-5 py-2 text-xs font-semibold transition-colors">
                  Skip Filler Guides →
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
