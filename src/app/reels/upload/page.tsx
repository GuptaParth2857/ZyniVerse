import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReelUpload from "./ReelUpload";

export const metadata: Metadata = {
  title: "Upload Reel | ZyniVerse",
};

export default async function ReelUploadPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <ReelUpload />;
}
