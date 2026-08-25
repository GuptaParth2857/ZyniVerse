"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const FACTS = [
  { value: "~400", label: "Manga titles at launch", color: "var(--color-magenta)" },
  { value: "1M+", label: "Pages of manga", color: "var(--color-cyan)" },
  { value: "100+", label: "Languages, incl. Hindi", color: "#ffd700" },
  { value: "150+", label: "Shojo titles included", color: "#ff6b9d" },
  { value: "~300", label: "First-ever translations", color: "#a78bfa" },
  { value: "Free", label: "No account required", color: "var(--color-cyan)" },
];

const TITLES = [
  "One Piece",
  "Naruto",
  "Bleach",
  "Demon Slayer",
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
  { name: "English", flag: "🇬🇧" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Chinese", flag: "🇨🇳" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "Turkish", flag: "🇹🇷" },
  { name: "Tagalog", flag: "🇵🇭" },
  { name: "Korean", flag: "🇰🇷" },
  { name: "Polish", flag: "🇵🇱" },
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

const STEPS = [
  "Open mangamillion.shueisha.co.jp in a recent version of Chrome, Edge, Safari or Firefox (mobile apps exist for iOS/iPadOS and Android).",
  "Pick any of the ~400 titles — or filter by the shojo, shonen, and seinen collections.",
  "Select your language. One Piece supports up to 107 languages; others vary by title.",
  "Start reading — no account, no payment, no limits. Free until the end of 2027.",
];

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return { ref, count };
}

function CountDisplay({ hasNumber, fact, count }: { hasNumber: boolean; fact: (typeof FACTS)[0]; count: number }) {
  if (!hasNumber) return <>{fact.value}</>;
  const prefix = fact.value.startsWith("~") ? "~" : "";
  const suffix = fact.value.includes("+") ? "+" : "";
  return <>{`${prefix}${count}${suffix}`}</>;
}

function StatCard({ fact, index }: { fact: (typeof FACTS)[0]; index: number }) {
  const parsed = parseInt(fact.value.replace(/[^0-9]/g, ""));
  const hasNumber = !isNaN(parsed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.03 }}
      className="group relative rounded-xl neon-rgb-border bg-[var(--color-panel)] p-5 text-center overflow-hidden cursor-default"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 80%, ${fact.color}15 0%, transparent 70%)`,
        }}
      />
      <StatValue fact={fact} hasNumber={hasNumber} target={parsed} />
      <p className="relative mt-1.5 text-xs text-[var(--color-mute)] leading-tight">{fact.label}</p>
    </motion.div>
  );
}

function StatValue({ fact, hasNumber, target }: { fact: (typeof FACTS)[0]; hasNumber: boolean; target: number }) {
  const { ref, count } = useCountUp(hasNumber ? target : 0);
  return (
    <div ref={ref} className="relative font-mono text-3xl font-bold" style={{ color: fact.color }}>
      <CountDisplay hasNumber={hasNumber} fact={fact} count={count} />
    </div>
  );
}

function Section({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function FaqItem({ faq, index }: { faq: (typeof FAQS)[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="border-b border-[var(--color-line)] last:border-b-0"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left group"
      >
        <h3 className="text-sm font-bold text-[var(--color-ink)] group-hover:text-[var(--color-cyan)] transition-colors">
          {faq.q}
        </h3>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-lg text-[var(--color-magenta)]"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-sm text-[var(--color-mute)] leading-relaxed">{faq.a}</p>
      </motion.div>
    </motion.div>
  );
}

export default function MangaMillionClient() {
  return (
    <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Hero glow orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-magenta)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute top-20 -right-40 w-[400px] h-[400px] rounded-full bg-[var(--color-cyan)]/5 blur-[100px]" />

      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-8 flex items-center gap-2 text-xs text-[var(--color-mute)]"
      >
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-[var(--color-cyan)] transition-colors">News</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">MANGA MILLION</span>
      </motion.nav>

      {/* Hero */}
      <div className="relative mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-magenta)]/10 border border-[var(--color-magenta)]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)] animate-pulse" />
            Breaking · Shueisha · August 2026
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="neon-rgb-border inline-block rounded-xl px-5 py-3 font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
        >
          MANGA MILLION: Shueisha&apos;s Free Manga Platform
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-5 max-w-3xl text-lg text-[var(--color-mute)] leading-relaxed"
        >
          Shueisha just launched <strong className="text-[var(--color-ink)]">MANGA MILLION</strong> — a free
          digital platform with nearly <strong className="text-[var(--color-cyan)]">400 manga titles</strong>{" "}
          (about <strong className="text-[var(--color-cyan)]">one million pages</strong>) translated into{" "}
          <strong className="text-[var(--color-cyan)]">over 100 languages including Hindi</strong>. No account.
          No registration. Just read.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-7 flex flex-wrap gap-3"
        >
          <a
            href="https://mangamillion.shueisha.co.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative overflow-hidden rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-xs font-bold text-black transition-all hover:shadow-[0_0_24px_-4px_var(--color-magenta)]"
          >
            <span className="relative z-10">Visit MANGA MILLION →</span>
          </a>
          <Link
            href="/search?q=one%20piece"
            className="rounded-full neon-rgb-border px-6 py-2.5 text-xs font-semibold transition-all hover:bg-white/5"
          >
            Track These Anime on ZyniVerse →
          </Link>
          <Link
            href="/manga"
            className="rounded-full neon-rgb-border px-6 py-2.5 text-xs font-semibold transition-all hover:bg-white/5"
          >
            Browse Manga Database →
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FACTS.map((f, i) => (
          <StatCard key={f.label} fact={f} index={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* What */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--color-magenta)]/5 blur-[60px]" />
            <h2 className="relative font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span> What is MANGA MILLION?
            </h2>
            <div className="relative space-y-3 text-sm text-[var(--color-mute)] leading-relaxed">
              <p>
                MANGA MILLION is Shueisha&apos;s 100th-anniversary project and one of the largest official manga
                localization efforts ever attempted. At launch (August 6, 2026) it carries approximately{" "}
                <strong className="text-[var(--color-cyan)]">400 manga titles</strong> — including One Piece, Naruto,
                Bleach, Demon Slayer, Jujutsu Kaisen, Chainsaw Man, Oshi no Ko, SPY×FAMILY, Hunter x Hunter and more —
                spanning roughly <strong className="text-[var(--color-cyan)]">one million pages</strong>.
              </p>
              <p>
                Nearly <strong className="text-[var(--color-cyan)]">300 titles are receiving their first-ever official
                translation</strong>, and 50 works were translated into multiple languages specifically for this
                project. Shueisha confirmed all translations were done by professional translators —{" "}
                <strong className="text-[var(--color-magenta)]">no AI was used</strong>.
              </p>
              <p>
                The service is <strong className="text-green-400">completely free and requires no registration</strong>,
                available worldwide for a limited time — currently scheduled through the end of December 2027.
              </p>
            </div>
          </Section>

          {/* India */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8 relative overflow-hidden" delay={0.05}>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[var(--color-cyan)]/5 blur-[50px]" />
            <h2 className="relative font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🇮🇳</span> Why it matters for Indian manga fans
            </h2>
            <ul className="relative space-y-4">
              {[
                { label: "Hindi is included:", text: "Hindi is among the 100+ languages on the platform. One Piece alone is available in 107 languages. Official-quality Hindi manga from Shueisha directly — a first for many Indian readers.", color: "var(--color-cyan)" },
                { label: "No sign-up barrier:", text: "Most manga apps require an account. MANGA MILLION lets you open the site and read instantly — great for Indian users who want zero-friction access.", color: "var(--color-magenta)" },
                { label: "Regional reach:", text: "The language list spans beyond English, meaning readers across India can finally read officially translated versions of classic series.", color: "#ffd700" },
                { label: "Free and legal:", text: "It is the official platform, so you support creators instead of relying on scanlation sites.", color: "#a78bfa" },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  className="flex gap-3 text-sm text-[var(--color-mute)] leading-relaxed"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>
                    <strong className="text-[var(--color-ink)]">{item.label}</strong> {item.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Section>

          {/* How */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8 relative overflow-hidden" delay={0.1}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[var(--color-magenta)]/5 blur-[50px]" />
            <h2 className="relative font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span> How to start reading
            </h2>
            <ol className="relative space-y-4 list-none">
              {STEPS.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-3 text-sm text-[var(--color-mute)] leading-relaxed"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-magenta)]/15 font-mono text-xs font-bold text-[var(--color-magenta)]">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </motion.li>
              ))}
            </ol>
          </Section>

          {/* FAQ */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8" delay={0.15}>
            <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">❓</span> MANGA MILLION FAQ
            </h2>
            <div>
              {FAQS.map((f, i) => (
                <FaqItem key={f.q} faq={f} index={i} />
              ))}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Confirmed titles */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6">
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">🔥</span> Confirmed titles
            </h2>
            <p className="text-xs text-[var(--color-mute)] mb-4">
              Hits and fan favourites included at launch:
            </p>
            <div className="flex flex-wrap gap-2">
              {TITLES.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <Link
                    href={`/search?q=${encodeURIComponent(t)}`}
                    className="inline-block rounded-lg border border-[var(--color-cyan)]/20 bg-[var(--color-cyan)]/5 px-3 py-1.5 text-xs font-medium text-[var(--color-cyan)] transition-all hover:bg-[var(--color-cyan)]/15 hover:border-[var(--color-cyan)]/40 hover:shadow-[0_0_12px_-3px_var(--color-cyan)]"
                  >
                    {t}
                  </Link>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Shojo spotlight */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6" delay={0.05}>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <span className="text-lg">🌸</span> Shojo spotlight
            </h2>
            <p className="text-sm text-[var(--color-mute)] leading-relaxed">
              More than <strong className="text-[var(--color-magenta)]">150 of the titles are shojo manga</strong> —
              including classics like <strong className="text-[var(--color-ink)]">NANA</strong> and{" "}
              <strong className="text-[var(--color-ink)]">Kimi ni Todoke</strong> — one of the largest officially
              translated shojo collections ever offered internationally.
            </p>
          </Section>

          {/* Languages */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6" delay={0.1}>
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-lg">🌍</span> Languages at launch
            </h2>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l, i) => (
                <motion.span
                  key={l.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ scale: 1.08 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-void)] border border-[var(--color-line)] px-3 py-1.5 text-[11px] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/30 hover:text-[var(--color-cyan)] cursor-default"
                >
                  <span>{l.flag}</span> {l.name}
                </motion.span>
              ))}
              <span className="rounded-full bg-[var(--color-void)] border border-[var(--color-line)] px-3 py-1.5 text-[11px] text-[var(--color-mute)]">
                + 90 more
              </span>
            </div>
          </Section>

          {/* CTA */}
          <Section className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-6 text-center relative overflow-hidden" delay={0.15}>
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-magenta)]/5 to-transparent" />
            <p className="relative font-display text-lg font-bold">Explore more on ZyniVerse</p>
            <div className="relative mt-4 flex flex-col gap-2.5">
              <Link href="/news" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black hover:shadow-[0_0_20px_-4px_var(--color-magenta)] transition-all">
                Latest Anime News →
              </Link>
              <Link href="/manga" className="rounded-full neon-rgb-border px-5 py-2.5 text-xs font-semibold transition-all hover:bg-white/5">
                Manga Database →
              </Link>
              <Link href="/filler" className="rounded-full neon-rgb-border px-5 py-2.5 text-xs font-semibold transition-all hover:bg-white/5">
                Skip Filler Guides →
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
