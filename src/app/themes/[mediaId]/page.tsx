import { Metadata } from "next";
import { notFound } from "next/navigation";
import ThemeDetailClient from "./content";

const ANIME_TITLES: Record<number, string> = {
  21: "One Piece", 16498: "Attack on Titan", 1735: "Naruto Shippuden",
  5114: "Fullmetal Alchemist: Brotherhood", 1535: "Frieren: Beyond Journey's End",
  813: "Dragon Ball", 11061: "Fate/Zero", 113415: "Solo Leveling",
  101922: "Frieren: Beyond Journey's End", 127230: "Demon Slayer",
  30276: "Code Geass", 9253: "K-On!", 1: "Cowboy Bebop", 2001: "Steins;Gate",
  23755: "Jujutsu Kaisen", 24701: "Mashle", 28755: "Your Lie in April",
  31964: "Beastars", 34438: "Yuri on Ice", 37521: "Princess Connect! Re:Dive",
  11757: "Sword Art Online", 19815: "Kill la Kill", 20464: "Parasyte",
  21459: "No Game No Life", 21570: "Barakamon", 22319: "Dragon Ball Super",
  10087: "Guilty Crown", 23273: "Yuki Yuna is a Hero", 2904: "Madoka Magica",
  31240: "Kabaneri", 33352: "Idolmaster Cinderella Girls", 35760: "Your Lie in April",
  37991: "Interspecies Reviewers", 40748: "Chainsaw Man", 41467: "Blue Lock",
};

export async function generateMetadata({ params }: { params: Promise<{ mediaId: string }> }): Promise<Metadata> {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  const title = ANIME_TITLES[id] || `Anime #${id}`;
  return {
    title: `${title} Theme Songs — ZyniVerse`,
    description: `Browse opening and ending theme songs for ${title}`,
  };
}

export default async function ThemeDetailPage({ params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) notFound();

  return <ThemeDetailClient mediaId={id} />;
}
