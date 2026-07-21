import { Metadata } from "next";
import { getUpcoming, bestTitle } from "@/lib/anilist";
import UpcomingClient from "./content";

export const metadata: Metadata = {
  title: "Upcoming Anime - ZyniVerse",
  description: "Preview upcoming anime releases with details and trailers",
};

export default async function UpcomingSeasonPage() {
  let anime: any[] = [];
  try {
    anime = await getUpcoming(50);
  } catch {}

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <UpcomingClient anime={anime} />
      </div>
    </main>
  );
}
