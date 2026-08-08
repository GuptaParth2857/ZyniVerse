import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPublicProfileData } from "@/lib/public-profile";
import { safeDecode } from "@/lib/url-params";
import PublicProfile from "@/components/PublicProfile";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = safeDecode(rawUsername);
  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true, bio: true },
  });
  if (!user) return { title: "User Not Found | ZyniVerse" };
  return {
    title: `${user.username} — Profile | ZyniVerse`,
    description: user.bio || `View ${user.username}'s anime profile on ZyniVerse.`,
    robots: { index: false, follow: true },
  };
}

export default async function UsernameProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = safeDecode(rawUsername);

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!user) notFound();

  const session = await auth();
  if (session?.user?.id && session.user.id === user.id) redirect("/profile");

  const data = await getPublicProfileData(user.id);
  if (!data) notFound();

  return <PublicProfile {...data} />;
}
