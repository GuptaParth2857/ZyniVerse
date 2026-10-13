import type { Metadata } from "next";
import StatusPageClient from "./StatusPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "ZyniVerse API Status — System Health",
  description: "Check the current status of ZyniVerse API services, including API server, database, and upstream services.",
  alternates: { canonical: `${BASE_URL}/status` },
};

export default function StatusPage() {
  return <StatusPageClient />;
}
