import type { Metadata } from "next";
import MessagesClient from "./MessagesClient";

export const metadata: Metadata = {
  title: "Messages — Chat with Friends | ZyniVerse",
  description:
    "Send direct messages to other anime fans. Chat about anime, share recommendations, and make friends.",
};

export default function MessagesPage() {
  return <MessagesClient />;
}
