import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });

  const body = await req.text();

  try {
    // Verify webhook signature using Stripe secret
    // const event = Stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    // For now parse directly (Stripe integration ready when you add STRIPE_SECRET_KEY)
    const event = JSON.parse(body);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || "pro";

        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeId: session.id,
              stripeCustomerId: session.customer,
              plan,
              status: "active",
              currentPeriodStart: new Date(session.created * 1000),
              currentPeriodEnd: new Date((session.created + 30 * 24 * 3600) * 1000),
            },
            update: {
              stripeId: session.id,
              stripeCustomerId: session.customer,
              plan,
              status: "active",
              currentPeriodStart: new Date(session.created * 1000),
              currentPeriodEnd: new Date((session.created + 30 * 24 * 3600) * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeSubId = subscription.id;
        const existing = await prisma.subscription.findUnique({ where: { stripeId: stripeSubId } });
        if (existing) {
          await prisma.subscription.update({
            where: { id: existing.id },
            data: { status: "canceled", cancelAtPeriodEnd: false },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
