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
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
          <h1 className="text-2xl font-bold text-[var(--color-ink)]">Notifications</h1>
        </div>
        <p className="mt-1 text-sm text-[var(--color-mute)]">
          View your notifications, airing alerts, and activity updates.
        </p>
      </div>
      <NotificationList />
    </main>
  );
}
