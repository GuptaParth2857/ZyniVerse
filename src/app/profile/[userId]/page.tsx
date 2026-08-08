import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getPublicProfileData } from "@/lib/public-profile";
import PublicProfile from "@/components/PublicProfile";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { title: "User Not Found | ZyniVerse" };
  return {
    title: `${user.username} — Profile | ZyniVerse`,
    description: user.bio || `View ${user.username}'s anime profile on ZyniVerse.`,
    robots: { index: false, follow: true },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const session = await auth();

  if (session?.user?.id && session.user.id === userId) {
    redirect("/profile");
  }

  const data = await getPublicProfileData(userId);
  if (!data) notFound();

  return <PublicProfile {...data} />;
}
