"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import AchievementGrid from "@/components/AchievementGrid";
import Loader from "@/components/Loader";

interface UserData {
  username: string;
  avatar?: string;
}

export default function UserAchievementsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader label="Loading user achievements..." />;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">// Achievements</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {user?.username ? `${user.username}'s Achievements` : "User Achievements"}
        </h1>

        <div className="mt-8">
          <AchievementGrid />
        </div>
      </div>
    </PageTransition>
  );
}
