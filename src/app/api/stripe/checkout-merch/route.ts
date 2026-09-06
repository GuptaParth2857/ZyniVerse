import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const items = Array.isArray(body?.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    const lineItems: {
      id: string;
      name: string;
      image: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const it of items) {
      const product = productMap.get(it.productId);
      if (!product) {
        return NextResponse.json({ error: "Some products are unavailable" }, { status: 400 });
      }
      const qty = Math.max(1, Math.min(10, Number(it.quantity) || 1));
      if (product.stock > 0 && product.stock < qty) {
        return NextResponse.json(
          { error: `${product.name} only has ${product.stock} in stock` },
          { status: 400 }
        );
      }
      subtotal += product.price * qty;
      lineItems.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: qty,
      });
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "upi"],
      line_items: lineItems.map((li) => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: li.name,
            images: li.image ? [li.image] : undefined,
          },
          unit_amount: li.price,
        },
        quantity: li.quantity,
      })),
      success_url: `${BASE_URL}/my-orders?success=true`,
      cancel_url: `${BASE_URL}/merch?canceled=true`,
      customer_email: session?.user?.email || undefined,
      metadata: {
        userId,
        orderType: "merch",
      },
    });

    await prisma.order.create({
      data: {
        userId,
        status: "pending",
        stripeSessionId: checkoutSession.id,
        subtotal,
        total: subtotal,
        currency: "inr",
        items: {
          create: lineItems.map((li) => ({
            productId: li.id,
            name: li.name,
            image: li.image,
            price: li.price,
            quantity: li.quantity,
          })),
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}