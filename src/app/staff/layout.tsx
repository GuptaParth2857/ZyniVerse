import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Anime Staff Directory - Voice Actors, Directors & More",
  description:
    "Browse anime and manga staff — voice actors, directors, writers, and producers. Search by name and explore their works.",
  alternates: { canonical: `${BASE_URL}/staff` },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
