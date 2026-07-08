"use client";

import { useState, useEffect, useCallback } from "react";
import type { AchievementDef } from "@/lib/achievements";

interface NotificationItem {
  id: string;
  achievement: AchievementDef;
  earnedAt: Date;
}

let notificationQueue: NotificationItem[] = [];
let listener: ((items: NotificationItem[]) => void) | null = null;

export function notifyAchievement(achievement: AchievementDef) {
  const item: NotificationItem = {
    id: Math.random().toString(36).slice(2),
    achievement,
    earnedAt: new Date(),
  };
  notificationQueue = [...notificationQueue, item];
  if (listener) listener(notificationQueue);
}

export function dismissNotification(id: string) {
  notificationQueue = notificationQueue.filter((n) => n.id !== id);
  if (listener) listener(notificationQueue);
}

export default function AchievementNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    listener = (items) => setNotifications([...items]);
    return () => { listener = null; };
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissNotification(id);
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) =>
      setTimeout(() => dismiss(n.id), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [notifications.length, notifications, dismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="animate-slide-in rounded-xl border border-[var(--color-violet)]/30 bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl p-4 flex items-start gap-3"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <div className="text-2xl">{n.achievement.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--color-violet)]">Achievement Unlocked!</p>
            <p className="text-sm font-semibold truncate">{n.achievement.name}</p>
            <p className="text-[10px] text-[var(--color-mute)] truncate">{n.achievement.description}</p>
            <p className="text-[10px] text-[var(--color-violet)] mt-0.5">+{n.achievement.points} points</p>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            className="text-[var(--color-mute)] hover:text-[var(--color-ink)] shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
