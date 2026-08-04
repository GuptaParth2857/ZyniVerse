import type { Metadata } from "next";
import ExternalBlogDetail from "@/components/ExternalBlogDetail";
import { CURATOR } from "@/lib/curator";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params: _params }: Props): Promise<Metadata> {
  return {
    title: `Blog Article | ZyniVerse`,
    description: `Read this anime blog article curated by ${CURATOR.username} from dev.to.`,
  };
}

export default async function ExternalBlogPage({ params }: Props) {
  const { id } = await params;  return <ExternalBlogDetail id={id} />;
}
