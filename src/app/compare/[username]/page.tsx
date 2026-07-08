import { Metadata } from "next";
import CompareContent from "./content";

export const metadata: Metadata = {
  title: "Compare Lists — ZyniVerse",
};

export default function ComparePage({ params }: { params: Promise<{ username: string }> }) {
  return <CompareContent paramsPromise={params} />;
}
