import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About ZyniVerse | Anime Filler Guides, Indian Dubs & Manga Tracker",
  description:
    "ZyniVerse (Zyniverse / Zyverse) is India's #1 free anime platform. Filler guides for 200+ anime, Indian dub tracking (Hindi, Tamil, Telugu), AI recommendations, manga reader, cosplay gallery, and an anime community. Visit zyverse.in.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
