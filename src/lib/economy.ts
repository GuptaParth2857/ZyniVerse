/**
 * The coins economy: earn rules, wallet movement, and the shared ledger.
 *
 * ## Two balances, one audit trail
 *
 * XP has always lived in `UserPoints` (achievements, referrals, the daily
 * login bonus all increment it). Coins are new and spendable, so they get
 * their own `CoinWallet`. What neither has is a history — you could see a
 * user's total points but never *why* it moved. `EconomyLedger` is that
 * history for both currencies: a row records what happened and what the
 * balance became right after. The wallet tables stay authoritative for reads
 * (a SUM over the ledger is O(history) and O(history) per request is how a
 * profile page becomes slow); the ledger is the record you audit against.
 *
 * ## Idempotency is the load-bearing wall
 *
 * `dedupeKey` = `{currency}:{reason}:{ref}` is unique, so a retried claim,
 * a double-clicked button, or a replayed reward cannot pay twice: the second
 * insert loses the race and the award is reported as `duplicate`. Callers
 * that have their own once-per-day guard (the daily login) pass a ref such as
 * the day key so the DB constraint — not application state — is what makes a
 * reward safe to retry.
 */
import { prisma } from "./prisma";
import { getLevel, getNextLevelProgress, getRank, getNextRank, type RankInfo } from "./achievements";

export type Currency = "coin" | "xp";

export interface EconomyAward {
  coins: number;
  xp: number;
}

export class InsufficientCoinsError extends Error {
  constructor(public readonly needed: number, public readonly balance: number) {
    super(`Not enough coins: have ${balance}, need ${needed}`);
    this.name = "InsufficientCoinsError";
  }
}

/**
 * Published earn rates — the reference table the UI shows and the amounts
 * routes pass into `awardEconomy` for reason codes that are not computed
 * (the daily login's XP is streak-scaled, so its XP comes from the route and
 * only its coin leg is fixed here).
 */
export const EARN_RATES: Record<string, EconomyAward> = {
  DAILY_LOGIN: { coins: 15, xp: 0 },
  REVIEW_CREATED: { coins: 10, xp: 5 },
  FORUM_POST: { coins: 8, xp: 4 },
  FOLLOW_PEER: { coins: 5, xp: 2 },
  COMMENT_POSTED: { coins: 3, xp: 1 },
  CONTEST_WIN: { coins: 50, xp: 100 },
};

/** Human labels for ledger rows; anything unknown falls back to the raw code. */
export const REASON_LABEL: Record<string, string> = {
  DAILY_LOGIN: "Daily login",
  REVIEW_CREATED: "Review posted",
  FORUM_POST: "Forum post",
  FOLLOW_PEER: "Followed a member",
  COMMENT_POSTED: "Comment",
  CONTEST_WIN: "Contest win",
  SHOP_BUY_FREEZE: "Streak freeze",
};

/** The (tiny) spend side of the economy. One item today, more later. */
export const SHOP_ITEMS = {
  streak_freeze: {
    label: "Streak Freeze",
    cost: 50,
    icon: "🧊",
    description: "Protects your login streak through one missed day.",
  },
} as const;

export type ShopItemKey = keyof typeof SHOP_ITEMS;

export interface AwardResult extends EconomyAward {
  /** True when a ledger row for this award already existed — nothing was paid. */
  duplicate: boolean;
  leveledUp: boolean;
  newLevel: number | null;
}

/**
 * Pay the published rate for `reason`. Routes call this fire-and-forget so a
 * ledger hiccup can never fail the user's actual action (post, follow, …); the
 * `dedupeKey` means a later retry still pays exactly once. Unknown reasons are
 * a no-op rather than an error so callers can be added ahead of the rate table.
 */
export async function awardForReason(
  userId: string,
  reason: string,
  ref?: string
): Promise<AwardResult | null> {
  const rate = EARN_RATES[reason];
  if (!rate) return null;
  return awardEconomy(userId, reason, rate, ref);
}

function ledgerKey(currency: Currency, reason: string, ref?: string): string | null {
  // A missing/empty ref collapses to a fixed token instead of "undefined"/""
  // so the key is still unique per (currency, reason) rather than accidentally
  // colliding with a ref that literally is the empty string.
  return `${currency}:${reason}:${ref && ref.length > 0 ? ref : "-"}`;
}

/**
 * Pay an earn event in both currencies atomically.
 *
 * The transaction matters twice: XP and coins must not half-apply (a crash
 * between legs would mint one currency without the other), and the ledger row
 * must be written against the same state change it describes — `balanceAfter`
 * inside the transaction is the post-award balance by construction.
 */
export async function awardEconomy(
  userId: string,
  reason: string,
  amounts: EconomyAward,
  ref?: string
): Promise<AwardResult> {
  const coins = Math.max(0, Math.trunc(amounts.coins));
  const xp = Math.max(0, Math.trunc(amounts.xp));
  if (coins === 0 && xp === 0) {
    return { coins: 0, xp: 0, duplicate: false, leveledUp: false, newLevel: null };
  }

  const coinKey = coins > 0 ? ledgerKey("coin", reason, ref) : null;
  const xpKey = xp > 0 ? ledgerKey("xp", reason, ref) : null;
  const keys = [coinKey, xpKey].filter((k): k is string => k !== null);
  const existing = await prisma.economyLedger.findFirst({
    where: { dedupeKey: { in: keys } },
    select: { id: true },
  });
  if (existing) {
    return { coins: 0, xp: 0, duplicate: true, leveledUp: false, newLevel: null };
  }

  return prisma.$transaction(async (tx) => {
    let leveledUp = false;
    let newLevel: number | null = null;

    if (xp > 0) {
      const up = await tx.userPoints.upsert({
        where: { userId },
        update: { points: { increment: xp } },
        create: { userId, points: xp, level: 1 },
      });
      const level = getLevel(up.points);
      if (level !== up.level) {
        await tx.userPoints.update({ where: { userId }, data: { level } });
        leveledUp = true;
        newLevel = level;
      }
      await tx.economyLedger.create({
        data: {
          userId,
          currency: "xp",
          amount: xp,
          balanceAfter: up.points,
          reason,
          ref: ref ?? null,
          dedupeKey: xpKey,
        },
      });
    }

    let paidCoins = 0;
    if (coins > 0) {
      const wallet = await tx.coinWallet.upsert({
        where: { userId },
        update: { balance: { increment: coins }, lifetimeEarned: { increment: coins } },
        create: { userId, balance: coins, lifetimeEarned: coins },
      });
      paidCoins = coins;
      await tx.economyLedger.create({
        data: {
          userId,
          currency: "coin",
          amount: coins,
          balanceAfter: wallet.balance,
          reason,
          ref: ref ?? null,
          dedupeKey: coinKey,
        },
      });
    }

    return { coins: paidCoins, xp, duplicate: false, leveledUp, newLevel };
  });
}

/**
 * Pay `amount` coins out of the wallet. Standalone ledger movement (tests,
 * future one-off refunds); the shop goes through `buyShopItem` instead so the
 * debit and the grant share one transaction.
 *
 * The debit is inlined rather than shared with `buyShopItem` because the
 * extended Prisma client's transaction type cannot be named (`Prisma.TransactionClient`
 * is the plain client, and passing the extended `tx` to it fails to typecheck);
 * inlining keeps `tx` inferred from the callback.
 */
export async function spendCoins(
  userId: string,
  amount: number,
  reason: string,
  ref?: string
): Promise<number> {
  const cost = Math.trunc(amount);
  if (cost <= 0) throw new Error("spend amount must be positive");

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.coinWallet.findUnique({ where: { userId }, select: { balance: true } });
    const balance = wallet?.balance ?? 0;
    if (balance < cost) throw new InsufficientCoinsError(cost, balance);

    // The WHERE is the real guard: if another spend drained the wallet between
    // the read above and this update, `count` is 0 and the transaction rolls
    // back rather than recording a debit that never happened.
    const claimed = await tx.coinWallet.updateMany({
      where: { userId, balance: { gte: cost } },
      data: { balance: { decrement: cost } },
    });
    if (claimed.count === 0) throw new InsufficientCoinsError(cost, balance);

    const after = await tx.coinWallet.findUnique({ where: { userId }, select: { balance: true } });
    const balanceAfter = after?.balance ?? balance - cost;
    await tx.economyLedger.create({
      data: {
        userId,
        currency: "coin",
        amount: -cost,
        balanceAfter,
        reason,
        ref: ref ?? null,
        dedupeKey: ledgerKey("coin", reason, ref),
      },
    });
    return balanceAfter;
  });
}

export interface LedgerEntry {
  id: string;
  currency: Currency;
  amount: number;
  balanceAfter: number;
  reason: string;
  label: string;
  ref: string | null;
  createdAt: Date;
}

export async function getLedger(userId: string, limit = 8): Promise<LedgerEntry[]> {
  const rows = await prisma.economyLedger.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 50),
  });
  return rows.map((r) => ({
    id: r.id,
    currency: r.currency === "xp" ? "xp" : "coin",
    amount: r.amount,
    balanceAfter: r.balanceAfter,
    reason: r.reason,
    // Resolved server-side so the client never imports this module (which
    // reaches Prisma) just to turn a code into a label.
    label: REASON_LABEL[r.reason] ?? r.reason,
    ref: r.ref,
    createdAt: r.createdAt,
  }));
}

export interface EconomyState {
  coins: number;
  lifetimeEarned: number;
  points: number;
  level: number;
  levelProgress: { current: number; needed: number };
  rank: RankInfo;
  nextRank: { rank: RankInfo; needed: number } | null;
  freezes: number;
  recent: LedgerEntry[];
}

/**
 * Everything the wallet widget needs in one call: three point reads plus the
 * recent ledger page. Missing rows read as zeroes so a user who has never
 * earned anything still gets a coherent page instead of a null branch.
 */
export async function getEconomy(userId: string): Promise<EconomyState> {
  const [wallet, points, freezes, recent] = await Promise.all([
    prisma.coinWallet.findUnique({ where: { userId } }),
    prisma.userPoints.findUnique({ where: { userId } }),
    prisma.streakFreeze.findUnique({ where: { userId }, select: { count: true } }),
    getLedger(userId, 8),
  ]);

  const totalPoints = points?.points ?? 0;
  return {
    coins: wallet?.balance ?? 0,
    lifetimeEarned: wallet?.lifetimeEarned ?? 0,
    points: totalPoints,
    level: points?.level ?? 1,
    levelProgress: getNextLevelProgress(totalPoints),
    rank: getRank(totalPoints),
    nextRank: getNextRank(totalPoints),
    freezes: freezes?.count ?? 0,
    recent,
  };
}

export interface PurchaseResult {
  item: ShopItemKey;
  balance: number;
  count: number;
}

/**
 * Buy a shop item: spend the coins and grant the effect. Two tables move, so
 * one transaction — a wallet debit without its grant would be theft, a grant
 * without the debit would be free money, and neither failure is visible until
 * a user complains.
 */
export async function buyShopItem(userId: string, key: ShopItemKey): Promise<PurchaseResult> {
  const item = SHOP_ITEMS[key];
  const { balance, count } = await prisma.$transaction(async (tx) => {
    const wallet = await tx.coinWallet.findUnique({ where: { userId }, select: { balance: true } });
    const current = wallet?.balance ?? 0;
    if (current < item.cost) throw new InsufficientCoinsError(item.cost, current);

    const claimed = await tx.coinWallet.updateMany({
      where: { userId, balance: { gte: item.cost } },
      data: { balance: { decrement: item.cost } },
    });
    if (claimed.count === 0) throw new InsufficientCoinsError(item.cost, current);

    const after = await tx.coinWallet.findUnique({ where: { userId }, select: { balance: true } });
    const balance = after?.balance ?? current - item.cost;
    await tx.economyLedger.create({
      data: {
        userId,
        currency: "coin",
        amount: -item.cost,
        balanceAfter: balance,
        reason: "SHOP_BUY_FREEZE",
        ref: key,
        dedupeKey: ledgerKey("coin", "SHOP_BUY_FREEZE", key),
      },
    });

    const freeze = await tx.streakFreeze.upsert({
      where: { userId },
      update: { count: { increment: 1 } },
      create: { userId, count: 1 },
    });
    return { balance, count: freeze.count };
  });

  return { item: key, balance, count };
}
