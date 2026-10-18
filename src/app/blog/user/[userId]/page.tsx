import type { Metadata } from "next";
import UserBlogClient from "./client";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  return {
    title: `Blog Posts by User`,
    description: `Blog posts by user ${userId} on ZyniVerse.`,
  };
}

export default async function UserBlogPage({ params }: Props) {
  const { userId } = await params;
  return <UserBlogClient userId={userId} />;
}
