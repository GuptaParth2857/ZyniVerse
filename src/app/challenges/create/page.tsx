import type { Metadata } from "next";
import CreateChallengeClient from "./CreateChallengeClient";

export const metadata: Metadata = {
  title: "Create Challenge",
  description: "Create a custom anime or manga watching challenge for the ZyniVerse community. Set your own goals and rules, invite friends, and track progress together.",
};

export default function CreateChallengePage() {
  return <CreateChallengeClient />;
}
