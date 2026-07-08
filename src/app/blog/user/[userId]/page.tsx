import type { Metadata } from "next";
import UserBlogClient from "./client";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  return {
    title: `Blog Posts by User | ZyniVerse`,
    description: `Blog posts by user ${userId} on ZyniVerse.`,
  };
}

export default async function UserBlogPage({ params }: Props) {
  const { userId } = await params;
  return <UserBlogClient userId={userId} />;
}
