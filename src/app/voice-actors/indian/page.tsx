import type { Metadata } from "next";
import IndianVoiceActorsClient from "./client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const metadata: Metadata = {
  title: "Indian Anime Voice Actors — Hindi, Tamil & Telugu Dubs",
  description:
    "Meet the real Indian voice actors behind your favourite anime dubs in Hindi, Tamil, and Telugu. Verified credits from Crunchyroll, Sony YAY!, Muse India & Cartoon Network.",
  alternates: { canonical: `${BASE_URL}/voice-actors/indian` },
};

export default function IndianVoiceActorsPage() {
  return <IndianVoiceActorsClient />;
}
