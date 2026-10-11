import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session-user";
import { EARN_RATES, REASON_LABEL, SHOP_ITEMS, getEconomy } from "@/lib/economy";

// Wallet state is per-user and changes on every claim/spend, so it must never be
// cached by a shared cache. The session cookie already keys it per visitor.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const userId = await getSessionUserId(req.headers);
  if (!userId) return NextResponse.json({ authenticated: false });

  const state = await getEconomy(userId);
  return NextResponse.json({
    authenticated: true,
    ...state,
    // Published earn rules so the UI never hardcodes balances it cannot audit.
    rates: Object.entries(EARN_RATES).map(([reason, amounts]) => ({
      reason,
      label: REASON_LABEL[reason] ?? reason,
      coins: amounts.coins,
      xp: amounts.xp,
    })),
    shop: Object.entries(SHOP_ITEMS).map(([key, item]) => ({ key, ...item })),
  });
}
