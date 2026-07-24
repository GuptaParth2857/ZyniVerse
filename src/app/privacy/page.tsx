import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ZyniVerse privacy policy. Learn how we collect, use, and protect your data on India's #1 free anime platform.",
  alternates: { canonical: `${BASE_URL}/privacy` },
  robots: { index: true, follow: true },
};

export const revalidate = 86400;

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
        <Link href="/" className="hover:text-[var(--color-cyan)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">Privacy Policy</span>
      </nav>
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
          <h2 className="font-display text-lg font-semibold text-white">3. Cookies & Tracking</h2>
          <p className="mt-2">
            ZyniVerse uses essential cookies for authentication and session management. We also
            use analytics cookies (with your consent) to understand how the site is used and
            improve performance. You can manage your cookie preferences via our cookie consent banner.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">4. Third-Party Services</h2>
          <p className="mt-2">
            We use third-party services for hosting (Vercel), analytics (custom), and advertisements
            (Google AdSense). These services may collect data according to their own privacy policies.
            We do not share personally identifiable information with advertisers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">5. Data Security</h2>
          <p className="mt-2">
            We implement industry-standard security measures to protect your data, including
            encryption in transit (HTTPS) and secure authentication via NextAuth.js. However,
            no method of electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">6. Your Rights</h2>
          <p className="mt-2">
            You have the right to access, modify, or delete your personal data at any time.
            You can update your profile through the settings page, or contact us at
            support@zyverse.in to request full data deletion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">7. Children&apos;s Privacy</h2>
          <p className="mt-2">
            ZyniVerse is not directed at children under 13. We do not knowingly collect personal
            information from children under 13 years of age.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">8. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this privacy policy from time to time. Changes will be posted on this
            page with an updated revision date. Continued use of ZyniVerse after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-white">9. Contact Us</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please contact us at
            support@zyverse.in or visit our{" "}
            <Link href="/developer" className="text-[var(--color-cyan)] hover:underline">
              developer page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
