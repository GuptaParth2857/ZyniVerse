import { Metadata } from "next";
import UpcomingSeasonContent from "./content";

export const metadata: Metadata = {
  title: "Upcoming Season - ZyniVerse",
  description: "Preview upcoming anime seasons with trailers and details",
};

export default function UpcomingSeasonPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <UpcomingSeasonContent />
      </div>
    </main>
  );
}
