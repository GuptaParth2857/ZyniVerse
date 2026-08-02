import { redirect } from "next/navigation";

export default async function ReelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/reels?reel=${encodeURIComponent(id)}`);
}
