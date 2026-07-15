import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "upi"],
    line_items: [
      {
        price: "price_pro_monthly",
        quantity: 1,
      },
    ],
    success_url: `${BASE_URL}/premium?success=true`,
    cancel_url: `${BASE_URL}/premium?canceled=true`,
    customer_email: session.user.email || undefined,
    metadata: {
      userId: session.user.id,
      plan: "pro",
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
