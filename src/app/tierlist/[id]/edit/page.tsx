import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import TierListBuilder from "@/components/TierListBuilder";

export const metadata = {
  title: "Edit Tier List | ZyniVerse",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTierListPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const tierList = await prisma.tierList.findUnique({
    where: { id },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!tierList) notFound();
  if (tierList.userId !== session.user.id) redirect(`/tierlist/${id}`);

  return (
    <TierListBuilder
      initialData={{
        id: tierList.id,
        title: tierList.title,
        description: tierList.description,
        isPublic: tierList.isPublic,
        items: tierList.items.map((i) => ({
          id: i.id,
          tier: i.tier,
          mediaId: i.mediaId,
          mediaTitle: i.mediaTitle,
          mediaImage: i.mediaImage,
          order: i.order,
        })),
      }}
    />
  );
}
