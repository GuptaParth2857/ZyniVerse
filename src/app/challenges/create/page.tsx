import type { Metadata } from "next";
import CreateChallengeClient from "./CreateChallengeClient";

export const metadata: Metadata = {
  title: "Create Challenge — ZyniVerse",
  description: "Create a custom anime or manga challenge for the community.",
};

export default function CreateChallengePage() {
  return <CreateChallengeClient />;
}
