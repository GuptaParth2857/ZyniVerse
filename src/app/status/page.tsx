import type { Metadata } from "next";
import StatusPageClient from "./StatusPageClient";

export const metadata: Metadata = {
  title: "ZyniVerse API Status — System Health | ZyniVerse",
  description: "Check the current status of ZyniVerse API services, including API server, database, and upstream services.",
};

export default function StatusPage() {
  return <StatusPageClient />;
}
