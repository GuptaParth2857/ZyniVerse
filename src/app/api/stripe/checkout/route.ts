import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;

export async function POST() {
  if (!STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "upi"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
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
  } catch {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
