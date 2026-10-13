import type { Metadata } from "next";
import GraphExplorer from "@/components/graph/GraphExplorer";

export const metadata: Metadata = {
  title: "Knowledge Graph",
  description:
    "Explore how anime and characters connect. See the shortest chain of shared shows between any two of them.",
};

/**
 * Rendered per request, not prerendered.
 *
 * The page opens on whatever `?seed=` and `?depth=` say, so a shared link has to
 * show the graph it claims to. Left static, the build prerenders one HTML file
 * with no query string available and every visitor receives Naruto regardless of
 * the link they followed, with the real seed appearing only after hydration.
 *
 * Nothing is lost by asking for a render per request: the graph is built from a
 * live AniList traversal and the canvas is client-only, so there was never a
 * static result worth reusing.
 */
export const dynamic = "force-dynamic";

export default function GraphPage() {
  return <GraphExplorer />;
}