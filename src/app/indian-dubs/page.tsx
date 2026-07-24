import { redirect } from "next/navigation";

export const metadata = {
  title: "Hindi, Tamil & Telugu Dubbed Anime — Complete Indian Dub List (2026)",
  description: "Find every anime dubbed in Hindi, Tamil & Telugu. Current season, coming soon & available now. Updated weekly for Indian fans.",
  keywords: ["hindi dubbed anime", "tamil dubbed anime", "telugu dubbed anime", "indian anime dubs", "anime in hindi", "anime in tamil", "anime in telugu", "dubbed anime india"],
  openGraph: {
    title: "Hindi, Tamil & Telugu Dubbed Anime — Complete List",
    description: "Track every Indian anime dub. Hindi, Tamil & Telugu — current season, coming soon & available now.",
    url: "https://zyverse.in/indian-dubs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@GuptaParth2857",
    title: "Hindi, Tamil & Telugu Dubbed Anime — Complete List",
    description: "Track every Indian anime dub. Hindi, Tamil & Telugu — updated weekly.",
  },
  alternates: { canonical: "https://zyverse.in/indian-dubs" },
  robots: { index: true, follow: true },
};

export default function IndianDubsPage() {
  redirect("/dubbed?language=hindi");
}
