import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About ZyniVerse | Anime Filler Guides, Indian Dubs & Manga Tracker",
  description:
    "ZyniVerse (Zyniverse / Zyverse) is a free anime platform for fans worldwide. Filler guides for 200+ anime, watch orders, schedules, AI recommendations, manga reader, cosplay gallery, and an anime community — plus Hindi, Tamil & Telugu dub tracking. Visit zyverse.in.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
