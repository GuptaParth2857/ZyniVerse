"use client";

import WhatsAppShare from "@/components/WhatsAppShare";

export function MyListShareRow({
  username,
  type,
  count,
}: {
  username: string;
  type: "manga" | "watchlist";
  count: number;
}) {
  const base = typeof window !== "undefined" ? window.location.origin : "https://zyverse.in";
  const path = type === "manga" ? `/u/${username}/manga` : `/u/${username}/watchlist`;
  const shareText =
    type === "manga"
      ? `Check out ${username}'s manga list on ZyniVerse (${count} titles)! 📚`
      : `Check out ${username}'s anime watchlist on ZyniVerse (${count} titles)! 🎬`;
  return (
    <div className="mt-6 flex items-center justify-center">
      <WhatsAppShare url={`${base}${path}`} text={shareText} variant="pill" />
    </div>
  );
}