import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { prisma } from "@/lib/prisma";

async function GET_inner() {
  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { threads: { where: { isDeleted: false } } } },
    },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      threadCount: c._count.threads,
    })),
  });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
