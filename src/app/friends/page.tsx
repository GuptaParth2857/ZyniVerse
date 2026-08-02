import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import FriendsClient from "./FriendsClient";

export const metadata: Metadata = {
  title: "Friends | ZyniVerse",
  description:
    "Send and accept friend requests, and chat with your anime friends on ZyniVerse.",
  robots: { index: false, follow: false },
};

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <FriendsClient />;
}
