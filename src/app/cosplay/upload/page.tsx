import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CosplayUpload from "@/components/CosplayUpload";

export const metadata: Metadata = {
  title: "Upload Cosplay | ZyniVerse",
};

export default async function CosplayUploadPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return <CosplayUpload />;
}
