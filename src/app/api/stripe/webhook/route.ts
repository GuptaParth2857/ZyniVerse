export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || "pro";

      if (userId) {
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );
        const item = subscription.items.data[0];

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeId: subscription.id,
            stripePriceId: item?.price?.id || null,
            stripeCustomerId: (subscription.customer as string) || null,
            plan,
            status: "active",
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
          },
          update: {
            stripeId: subscription.id,
            stripePriceId: item?.price?.id || null,
            stripeCustomerId: (subscription.customer as string) || null,
            plan,
            status: "active",
            currentPeriodStart: new Date(item.current_period_start * 1000),
            currentPeriodEnd: new Date(item.current_period_end * 1000),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const item = subscription.items.data[0];
      const existing = await prisma.subscription.findUnique({
        where: { stripeId: subscription.id },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: subscription.status,
            currentPeriodStart: item ? new Date(item.current_period_start * 1000) : existing.currentPeriodStart,
            currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : existing.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeId: subscription.id },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: "canceled" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
