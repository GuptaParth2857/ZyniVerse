import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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