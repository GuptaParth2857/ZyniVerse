import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TierListBuilder from "@/components/TierListBuilder";

export const metadata = {
  title: "Create Tier List | ZyniVerse",
};

export default async function CreateTierListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <TierListBuilder />;
}
