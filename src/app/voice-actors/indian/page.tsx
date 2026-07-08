import type { Metadata } from "next";
import IndianVoiceActorsClient from "./client";

export const metadata: Metadata = {
  title: "Indian Anime Voice Actors — Hindi, Tamil & Telugu Dubs | ZyniVerse",
  description:
    "Meet the Indian voice actors behind your favorite anime dubs in Hindi, Tamil, and Telugu.",
};

export default function IndianVoiceActorsPage() {
  return <IndianVoiceActorsClient />;
}
