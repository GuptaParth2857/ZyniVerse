import type { Metadata } from "next";
import IndianVoiceActorsClient from "./client";

export const metadata: Metadata = {
  title: "Indian Anime Voice Actors — Hindi, Tamil & Telugu Dubs | ZyniVerse",
  description:
    "Meet the real Indian voice actors behind your favourite anime dubs in Hindi, Tamil, and Telugu. Verified credits from Crunchyroll, Sony YAY!, Muse India & Cartoon Network.",
};

export default function IndianVoiceActorsPage() {
  return <IndianVoiceActorsClient />;
}
