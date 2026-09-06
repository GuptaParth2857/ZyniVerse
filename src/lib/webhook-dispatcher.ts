import crypto from "crypto";
import { prisma } from "./prisma";

interface WebhookRecord {
  id: string;
  url: string;
  events: string;
  secret: string;
  isActive: boolean;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function dispatchWebhook(
  webhook: WebhookRecord,
  event: string,
  payload: Record<string, unknown>
) {
  const subscribedEvents = JSON.parse(webhook.events) as string[];
  if (!subscribedEvents.includes(event) && !subscribedEvents.includes("*")) {
    return null;
  }

  const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  const signature = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");

  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      event,
      payload: body,
      status: "pending",
      attempts: 0,
    },
  });

  const maxAttempts = 3;
  let attempt = 0;
  let lastError: string | null = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event,
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      const responseText = await response.text().catch(() => "");

      if (response.ok) {
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { status: "success", attempts: attempt, response: `${response.status}: ${responseText.slice(0, 500)}` },
        });
        return { ...delivery, status: "success", attempts: attempt };
      }

      lastError = `${response.status}: ${responseText.slice(0, 500)}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
    }

    if (attempt < maxAttempts) {
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  await prisma.webhookDelivery.update({
    where: { id: delivery.id },
    data: { status: "failed", attempts: attempt, response: lastError },
  });

  return { ...delivery, status: "failed", attempts: attempt };
}

export async function dispatchToAllWebhooks(event: string, payload: Record<string, unknown>) {
  const webhooks = await prisma.webhook.findMany({
    where: { isActive: true },
  });

  const results = await Promise.allSettled(
    webhooks.map((wh) => dispatchWebhook(wh, event, payload))
  );

  return results.filter((r) => r.status === "fulfilled" && r.value !== null).length;
}
