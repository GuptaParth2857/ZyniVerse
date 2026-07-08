import type { Metadata } from "next";
import CreateClubClient from "./CreateClubClient";

export const metadata: Metadata = {
  title: "Create a Club — ZyniVerse",
  description: "Create a new anime club or group on ZyniVerse. Bring your community together.",
};

export default function CreateClubPage() {
  return <CreateClubClient />;
}
