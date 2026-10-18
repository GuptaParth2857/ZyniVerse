import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FanArtUpload from "@/components/FanArtUpload";

export const metadata: Metadata = {
  title: "Upload Fan Art",
  robots: { index: false, follow: true },
};

export default async function FanArtUploadPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <FanArtUpload />;
}
