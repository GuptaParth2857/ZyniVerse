import { Metadata } from "next";
import { getUpcoming, type Media } from "@/lib/anilist";
import UpcomingClient from "./content";
import { logError } from "@/lib/logger";

export const metadata: Metadata = {
  title: "Upcoming Anime - ZyniVerse",
  description: "Preview upcoming anime releases with details and trailers",
};

export default async function UpcomingSeasonPage() {
  let anime: Media[] = [];
  try {
    anime = await getUpcoming(50);
  } catch (e) { logError(e); }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <UpcomingClient anime={anime} />
      </div>
    </main>
  );
}
