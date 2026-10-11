import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllLiveAction } from "@/lib/live-action-data";
import LiveActionDetailClient from "./detail-client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export const revalidate = 172800;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const list = await getAllLiveAction();
  const anime = list.find((a) => a.id === id);
  if (!anime) return { title: "Live-Action Anime Adaptation — ZyniVerse", robots: { index: false, follow: true } };
  return {
    title: `${anime.title} Live-Action — Cast, Rating & Where to Watch | ZyniVerse`,
    description: `Everything about the live-action adaptation of ${anime.title}: cast, release status, rating, and where to watch it.`,
    alternates: { canonical: `${BASE_URL}/live-action/${id}` },
    robots: { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  const list = await getAllLiveAction();
  return list.map((a) => ({ id: a.id }));
}

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
