import { notFound } from "next/navigation";
import { getAllLiveAction } from "@/lib/live-action-data";
import LiveActionDetailClient from "./detail-client";

export const revalidate = 3600;

export default async function LiveActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getAllLiveAction();
  const anime = list.find((a) => a.id === id);
  if (!anime) notFound();
  return <LiveActionDetailClient id={id} initialList={list} />;
}
