"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--color-mute)]">Last updated: July 2026</p>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-[var(--color-mute)]">
        <section>
          <h2 className="font-display text-lg font-semibold text-white">1. Acceptance</h2>
          <p className="mt-2">
            By using ZyniVerse, you agree to these terms. If you do not agree, please do not use
            the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">2. Account</h2>
          <p className="mt-2">
            You are responsible for maintaining the confidentiality of your account credentials. You
            must provide accurate information when registering. One account per person.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">3. Acceptable Use</h2>
          <p className="mt-2">
            You agree not to misuse the platform — including spamming, harassing others, posting
            harmful content, or attempting to disrupt the service. Community guidelines apply to all
            posts and comments.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">4. Content Ownership</h2>
          <p className="mt-2">
            You retain ownership of content you post. By posting, you grant ZyniVerse a
            non-exclusive, royalty-free license to display your content on the platform. We do not
            claim ownership of your data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">5. Third-Party Data</h2>
          <p className="mt-2">
            Anime and manga metadata displayed on ZyniVerse is sourced from the AniList API. This
            data is provided &ldquo;as is&rdquo; and we make no guarantees about its accuracy or
            completeness.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">6. Limitation of Liability</h2>
          <p className="mt-2">
            ZyniVerse is provided &ldquo;as is&rdquo; without warranties of any kind. We are not
            liable for damages arising from your use of the platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">7. Changes</h2>
          <p className="mt-2">
            We may update these terms at any time. Continued use after changes constitutes
            acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">8. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email us at{" "}
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
