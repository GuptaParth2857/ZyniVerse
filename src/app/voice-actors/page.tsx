import type { Metadata } from "next";
import VoiceActorsClient from "./client";

export const metadata: Metadata = {
  title: "Voice Actors — Japanese Seiyuu & English Dub Artists | ZyniVerse",
  description:
    "Browse Japanese seiyuu and English dub voice actors from Naruto, Dragon Ball, One Piece, Demon Slayer and more. Discover who voices your favourite characters.",
};

export default function VoiceActorsPage() {
  return <VoiceActorsClient />;
}
