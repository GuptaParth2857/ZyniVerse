import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WallpaperUpload from "@/components/WallpaperUpload";

export const metadata: Metadata = {
  title: "Upload Wallpaper | ZyniVerse",
};

export default async function WallpaperUploadPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <WallpaperUpload />;
}
