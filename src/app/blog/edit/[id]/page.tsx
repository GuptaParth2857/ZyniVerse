import type { Metadata } from "next";
import EditBlogClient from "./client";

export const metadata: Metadata = {
  title: "Edit Post | ZyniVerse",
  description: "Edit your blog post on ZyniVerse.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  return <EditBlogClient id={id} />;
}
