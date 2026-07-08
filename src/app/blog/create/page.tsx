import type { Metadata } from "next";
import BlogEditor from "@/components/BlogEditor";

export const metadata: Metadata = {
  title: "Create Blog Post | ZyniVerse",
  description: "Write and publish anime blog posts on ZyniVerse.",
};

export default function CreateBlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <BlogEditor />
    </div>
  );
}
