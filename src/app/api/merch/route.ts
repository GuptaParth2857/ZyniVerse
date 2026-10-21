import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { prisma } from "@/lib/prisma";

async function GET_inner() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        category: p.category,
        platform: p.platform,
        anime: p.anime,
        affiliateUrl: p.affiliateUrl,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}
