import type { Metadata } from "next";
import GraphExplorer from "@/components/graph/GraphExplorer";

export const metadata: Metadata = {
  title: "Knowledge Graph · ZyniVerse",
  description:
    "Explore how anime and characters connect. See the shortest chain of shared shows between any two of them.",
};

export default function GraphPage() {
  return <GraphExplorer />;
}