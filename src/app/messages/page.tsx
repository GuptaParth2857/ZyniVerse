import type { Metadata } from "next";
import { Suspense } from "react";
import MessagesClient from "./MessagesClient";

export const metadata: Metadata = {
  title: "Messages — Chat with Friends | ZyniVerse",
  description:
    "Send direct messages to other anime fans. Chat about anime, share recommendations, and make friends.",
  robots: { index: false, follow: false },
};

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesClient />
    </Suspense>
  );
}
