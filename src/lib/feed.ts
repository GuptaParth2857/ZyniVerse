export interface FeedCard {
  id: string;
  type: "MEME" | "REEL" | "MOMENT" | "FANART" | "COSPLAY" | "BLOG" | "NEWS";
  title: string;
  body?: string | null;
  image?: string | null;
  video?: string | null;
  href: string;
  author?: { username: string; avatar?: string | null } | null;
  createdAt: string;
}
