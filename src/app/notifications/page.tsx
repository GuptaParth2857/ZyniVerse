import type { Metadata } from "next";
import NotificationList from "@/components/NotificationList";

export const metadata: Metadata = {
  title: "Notifications | ZyniVerse",
  description: "View your notifications, airing alerts, and activity updates.",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="neon-rgb-border inline-block rounded-2xl bg-[var(--color-panel)]/60 px-5 py-3">
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-ink)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-base text-black shadow-[0_0_16px_-2px_var(--color-magenta)]">
              {"\u{1F514}"}
            </span>
            <span className="font-display tracking-wide">Notifications</span>
          </h1>
        </div>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          Airing alerts, activity updates, and everything happening across ZyniVerse.
        </p>
      </div>
      <NotificationList />
    </main>
  );
}
