import type { Metadata } from "next";
import VoiceActorsClient from "./client";

export const metadata: Metadata = {
  title: "Voice Actors — Anime Seiyuu & Indian Dubbing Artists | ZyniVerse",
  description:
    "Browse anime voice actors, Japanese seiyuu, and Indian dubbing artists. Discover who voices your favorite characters.",
};

export default function VoiceActorsPage() {
  return <VoiceActorsClient />;
}
