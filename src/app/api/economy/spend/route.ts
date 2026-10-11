import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limiter";
import { getSessionUserId } from "@/lib/session-user";
import { InsufficientCoinsError, SHOP_ITEMS, buyShopItem, type ShopItemKey } from "@/lib/economy";

// Spending moves real persisted balances; cap the write rate so a stuck retry
// loop cannot hammer the wallet rows.
const spendLimiter = createRateLimiter("economy-spend", {
  maxRequests: 10,
  windowMs: 60 * 1000,
});

export async function POST(req: NextRequest) {
  const blocked = await spendLimiter.middleware(req);
  if (blocked) return blocked;

  const userId = await getSessionUserId(req.headers);
  if (!userId) {
    return NextResponse.json({ error: "Sign in to spend coins." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const item = body?.item;
  if (typeof item !== "string" || !(item in SHOP_ITEMS)) {
    return NextResponse.json({ error: "Unknown shop item." }, { status: 400 });
  }

  try {
    const result = await buyShopItem(userId, item as ShopItemKey);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return NextResponse.json(
        { error: "Not enough coins.", needed: err.needed, balance: err.balance },
        { status: 402 }
      );
    }
    console.error("Economy spend error:", err);
    return NextResponse.json({ error: "Purchase failed." }, { status: 500 });
  }
}
