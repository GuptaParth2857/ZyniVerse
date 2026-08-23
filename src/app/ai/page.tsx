import type { Metadata } from "next";
import AiClient from "./client";

export const metadata: Metadata = {
  title: "Zyni AI | ZyniVerse",
  description: "Chat with Zyni AI, identify anime from screenshots, and search anime by vibe.",
};

export default function AiPage() {
  return <AiClient />;
}
