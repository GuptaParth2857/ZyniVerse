import { redirect } from "next/navigation";

export const metadata = {
  title: "Indian Anime Dubs — Hindi, Tamil & Telugu Dubbed Anime | ZyniVerse",
  description: "Complete guide to Indian anime dubs. Find Hindi, Tamil, and Telugu dubbed anime on Crunchyroll, Netflix, and more.",
  robots: { index: true, follow: true },
};

export default function IndianDubsPage() {
  redirect("/dubbed?language=hindi");
}
