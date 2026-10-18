import { Metadata } from "next";
import CompareContent from "./content";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

export const metadata: Metadata = {
  title: "Compare Lists",
};

export default function ComparePage({ params }: { params: Promise<{ username: string }> }) {
  return <CompareContent paramsPromise={params} />;
}
