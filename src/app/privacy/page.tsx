"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--color-mute)]">Last updated: July 2026</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-[var(--color-mute)]">
        <section>
          <h2 className="font-display text-lg font-semibold text-white">1. Information We Collect</h2>
          <p className="mt-2">
            When you create an account, we collect your email address and display name. We also
            collect watchlist data you choose to save to your profile, along with community content
            such as posts and comments. Anonymous usage analytics may be collected to improve the
            platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">2. How We Use Your Data</h2>
          <p className="mt-2">
            Your data is used solely to operate ZyniVerse: authenticating you, syncing your
            watchlist, displaying community content, and improving the service. We never sell your
            personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">3. Cookies</h2>
          <p className="mt-2">
            We use minimal cookies for authentication sessions and remembering your preferences. You
            may reject non-essential cookies via the consent banner. No tracking cookies are used.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">4. Third-Party Services</h2>
          <p className="mt-2">
            ZyniVerse uses the <strong>AniList API</strong> to fetch anime and manga metadata. Your
            interactions with that data are governed by AniList&apos;s own terms. We do not send
            personal data to AniList.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">5. Data Retention</h2>
          <p className="mt-2">
            Account data is retained until you delete your account. Community content you create
            may remain visible even after account deletion unless you remove it first.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">6. Contact</h2>
          <p className="mt-2">
            For privacy-related inquiries, reach us at{" "}
            <a href="mailto:contact.zenvyx@gmail.com" className="text-[var(--color-cyan)] hover:underline">
              contact.zenvyx@gmail.com
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-[var(--color-line)]">
        <Link href="/" className="text-sm text-[var(--color-cyan)] hover:underline">&larr; Back to Home</Link>
      </div>
    </div>
  );
}
