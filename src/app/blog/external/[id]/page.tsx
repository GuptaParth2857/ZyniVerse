import type { Metadata } from "next";
import ExternalBlogDetail from "@/components/ExternalBlogDetail";
import { CURATOR } from "@/lib/curator";

// Next.js only enables on-demand ISR for a dynamic segment when
// `generateStaticParams` exists. Empty array => no build-time prerender, but
// hits after the first are served from the CDN instead of a billed Node render.
export const revalidate = 43200;

export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params: _params }: Props): Promise<Metadata> {
  return {
    title: `Blog Article`,
    description: `Read this anime blog article curated by ${CURATOR.username} from dev.to.`,
  };
}

export default async function ExternalBlogPage({ params }: Props) {
  const { id } = await params;  return <ExternalBlogDetail id={id} />;
}
