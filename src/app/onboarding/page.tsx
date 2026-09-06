import type { Metadata } from "next";
import OnboardingWizard from "@/components/OnboardingWizard";

export const metadata: Metadata = {
  title: "Personalize ZyniVerse | Set your anime taste",
  description: "Pick your favourite anime genres and binge moods to get personalized recommendations on ZyniVerse.",
  robots: { index: false, follow: false },
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
