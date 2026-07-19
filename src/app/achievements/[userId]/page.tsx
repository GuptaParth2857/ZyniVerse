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
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#8a2be2]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#ff00ff]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(138,43,226,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-4">
            {user?.avatar && (
              <img src={user.avatar} alt={user.username} className="h-16 w-16 rounded-full border-2 border-[#8a2be2]" style={{ boxShadow: "0 0 20px rgba(138,43,226,0.4)" }} />
            )}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8a2be2]" style={{ textShadow: "0 0 10px rgba(138,43,226,0.5)" }}>{/* Achievements */}</p>
              <h1 className="font-display text-3xl font-bold sm:text-4xl text-white">
                {user?.username ? `${user.username}&apos;s Achievements` : "User Achievements"}
              </h1>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8a2be2] to-transparent shadow-[0_0_10px_rgba(138,43,226,0.5)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AchievementGrid />
      </div>
    </PageTransition>
  );
}
