/**
 * Guards the coins/XP economy: the wallet math, the shared ledger, the
 * idempotency that makes a retried claim safe, and the spend guard.
 *
 * The routes themselves are thin; the risk lives here in the transaction
 * wiring, so Prisma is mocked with an interactive-transaction seam (the
 * `$transaction` callback receives a fake tx) and every balance move is
 * asserted against the ledger row it must produce.
 */
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  EARN_RATES,
  InsufficientCoinsError,
  awardEconomy,
  awardForReason,
  buyShopItem,
  getEconomy,
  getLedger,
  spendCoins,
} from "@/lib/economy";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    economyLedger: { findFirst: vi.fn(), findMany: vi.fn() },
    coinWallet: { findUnique: vi.fn() },
    userPoints: { findUnique: vi.fn() },
    streakFreeze: { findUnique: vi.fn() },
  },
}));

// getLevel crosses to 3 at 100 points so the level-up branch is reachable.
vi.mock("@/lib/achievements", () => ({
  getLevel: vi.fn((points: number) => (points >= 100 ? 3 : 1)),
  getNextLevelProgress: vi.fn(() => ({ current: 0, needed: 100 })),
  getRank: vi.fn(() => ({ tier: 1, label: "Rookie", icon: "🌱", color: "#00e5ff", glow: "#00e5ff80" })),
  getNextRank: vi.fn(() => null),
}));

type TxMock = {
  userPoints: { upsert: Mock; update: Mock };
  coinWallet: { upsert: Mock; findUnique: Mock; updateMany: Mock };
  economyLedger: { create: Mock };
  streakFreeze: { upsert: Mock };
};

function makeTx(): TxMock {
  return {
    userPoints: { upsert: vi.fn(), update: vi.fn() },
    coinWallet: { upsert: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn() },
    economyLedger: { create: vi.fn() },
    streakFreeze: { upsert: vi.fn() },
  };
}

const db = () =>
  prisma as unknown as {
    $transaction: Mock;
    economyLedger: { findFirst: Mock; findMany: Mock };
    coinWallet: { findUnique: Mock };
    userPoints: { findUnique: Mock };
    streakFreeze: { findUnique: Mock };
  };

let tx: TxMock;

beforeEach(() => {
  vi.clearAllMocks();
  tx = makeTx();
  db().$transaction.mockImplementation(async (fn: (t: TxMock) => unknown) => fn(tx));
});

describe("awardEconomy", () => {
  it("pays both currencies and writes one ledger row per currency", async () => {
    db().economyLedger.findFirst.mockResolvedValue(null);
    tx.userPoints.upsert.mockResolvedValue({ points: 55, level: 1 });
    tx.coinWallet.upsert.mockResolvedValue({ balance: 75, lifetimeEarned: 75 });

    const res = await awardEconomy("u1", "REVIEW_CREATED", { coins: 10, xp: 5 }, "r1");

    expect(res).toEqual({ coins: 10, xp: 5, duplicate: false, leveledUp: false, newLevel: null });
    expect(tx.userPoints.upsert).toHaveBeenCalledWith({
      where: { userId: "u1" },
      update: { points: { increment: 5 } },
      create: { userId: "u1", points: 5, level: 1 },
    });
    expect(tx.coinWallet.upsert).toHaveBeenCalledWith({
      where: { userId: "u1" },
      update: { balance: { increment: 10 }, lifetimeEarned: { increment: 10 } },
      create: { userId: "u1", balance: 10, lifetimeEarned: 10 },
    });

    const rows = tx.economyLedger.create.mock.calls.map(([arg]) => arg.data);
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.currency === "xp")).toMatchObject({
      amount: 5,
      balanceAfter: 55,
      reason: "REVIEW_CREATED",
      dedupeKey: "xp:REVIEW_CREATED:r1",
    });
    expect(rows.find((r) => r.currency === "coin")).toMatchObject({
      amount: 10,
      balanceAfter: 75,
      dedupeKey: "coin:REVIEW_CREATED:r1",
    });
  });

  it("recomputes the level and reports the level-up", async () => {
    db().economyLedger.findFirst.mockResolvedValue(null);
    tx.userPoints.upsert.mockResolvedValue({ points: 150, level: 1 });

    const res = await awardEconomy("u1", "REVIEW_CREATED", { coins: 0, xp: 5 }, "r1");

    expect(tx.userPoints.update).toHaveBeenCalledWith({ where: { userId: "u1" }, data: { level: 3 } });
    expect(res.leveledUp).toBe(true);
    expect(res.newLevel).toBe(3);
  });

  it("treats a replayed award as a duplicate and pays nothing", async () => {
    db().economyLedger.findFirst.mockResolvedValue({ id: "led-1" });

    const res = await awardEconomy("u1", "REVIEW_CREATED", { coins: 10, xp: 5 }, "r1");

    expect(res).toEqual({ coins: 0, xp: 0, duplicate: true, leveledUp: false, newLevel: null });
    expect(db().$transaction).not.toHaveBeenCalled();
    expect(db().economyLedger.findFirst).toHaveBeenCalledWith({
      where: { dedupeKey: { in: ["coin:REVIEW_CREATED:r1", "xp:REVIEW_CREATED:r1"] } },
      select: { id: true },
    });
  });

  it("short-circuits when both amounts are zero", async () => {
    const res = await awardEconomy("u1", "DAILY_LOGIN", { coins: 0, xp: 0 }, "day");

    expect(res).toMatchObject({ coins: 0, xp: 0, duplicate: false, leveledUp: false });
    expect(db().economyLedger.findFirst).not.toHaveBeenCalled();
    expect(db().$transaction).not.toHaveBeenCalled();
  });
});

describe("awardForReason", () => {
  it("pays the published rate for a known reason", async () => {
    db().economyLedger.findFirst.mockResolvedValue(null);
    tx.userPoints.upsert.mockResolvedValue({ points: 2, level: 1 });
    tx.coinWallet.upsert.mockResolvedValue({ balance: 5, lifetimeEarned: 5 });

    const res = await awardForReason("u1", "FOLLOW_PEER", "peer-9");

    expect(res?.coins).toBe(EARN_RATES.FOLLOW_PEER.coins);
    expect(res?.xp).toBe(EARN_RATES.FOLLOW_PEER.xp);
  });

  it("is a no-op for an unknown reason", async () => {
    const res = await awardForReason("u1", "NOT_A_REASON", "x");
    expect(res).toBeNull();
    expect(db().$transaction).not.toHaveBeenCalled();
  });
});

describe("spendCoins", () => {
  it("refuses a spend larger than the balance", async () => {
    tx.coinWallet.findUnique.mockResolvedValueOnce({ balance: 40 });

    await expect(spendCoins("u1", 50, "SHOP_BUY_FREEZE", "streak_freeze")).rejects.toBeInstanceOf(
      InsufficientCoinsError
    );
    expect(tx.coinWallet.updateMany).not.toHaveBeenCalled();
    expect(tx.economyLedger.create).not.toHaveBeenCalled();
  });

  it("debits the wallet and records a negative ledger row", async () => {
    tx.coinWallet.findUnique
      .mockResolvedValueOnce({ balance: 100 })
      .mockResolvedValueOnce({ balance: 60 });
    tx.coinWallet.updateMany.mockResolvedValue({ count: 1 });

    const balance = await spendCoins("u1", 40, "SHOP_BUY_FREEZE", "streak_freeze");

    expect(balance).toBe(60);
    expect(tx.economyLedger.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ currency: "coin", amount: -40, balanceAfter: 60 }),
    });
  });

  it("rejects a non-positive amount without touching the database", async () => {
    await expect(spendCoins("u1", 0, "X")).rejects.toThrow("positive");
    expect(db().$transaction).not.toHaveBeenCalled();
  });

  it("rolls back when the conditional debit matches no row", async () => {
    tx.coinWallet.findUnique.mockResolvedValueOnce({ balance: 100 });
    tx.coinWallet.updateMany.mockResolvedValue({ count: 0 });

    await expect(spendCoins("u1", 40, "SHOP_BUY_FREEZE", "streak_freeze")).rejects.toBeInstanceOf(
      InsufficientCoinsError
    );
    expect(tx.economyLedger.create).not.toHaveBeenCalled();
  });
});

describe("buyShopItem", () => {
  it("debits and grants in a single transaction", async () => {
    tx.coinWallet.findUnique
      .mockResolvedValueOnce({ balance: 100 })
      .mockResolvedValueOnce({ balance: 50 });
    tx.coinWallet.updateMany.mockResolvedValue({ count: 1 });
    tx.streakFreeze.upsert.mockResolvedValue({ count: 2 });

    const res = await buyShopItem("u1", "streak_freeze");

    expect(res).toEqual({ item: "streak_freeze", balance: 50, count: 2 });
    expect(db().$transaction).toHaveBeenCalledTimes(1);
    expect(tx.streakFreeze.upsert).toHaveBeenCalledWith({
      where: { userId: "u1" },
      update: { count: { increment: 1 } },
      create: { userId: "u1", count: 1 },
    });
  });
});

describe("getEconomy / getLedger", () => {
  it("reads balances and labels ledger rows", async () => {
    db().coinWallet.findUnique.mockResolvedValue({ balance: 120, lifetimeEarned: 300 });
    db().userPoints.findUnique.mockResolvedValue({ points: 40, level: 2 });
    db().streakFreeze.findUnique.mockResolvedValue({ count: 1 });
    db().economyLedger.findMany.mockResolvedValue([
      {
        id: "l1",
        currency: "coin",
        amount: 15,
        balanceAfter: 120,
        reason: "DAILY_LOGIN",
        ref: "2026-10-9",
        createdAt: new Date(),
      },
    ]);

    const state = await getEconomy("u1");

    expect(state.coins).toBe(120);
    expect(state.lifetimeEarned).toBe(300);
    expect(state.points).toBe(40);
    expect(state.level).toBe(2);
    expect(state.freezes).toBe(1);
    expect(state.recent[0]).toMatchObject({ currency: "coin", amount: 15, label: "Daily login" });
  });

  it("reads missing rows as zero instead of null branches", async () => {
    db().coinWallet.findUnique.mockResolvedValue(null);
    db().userPoints.findUnique.mockResolvedValue(null);
    db().streakFreeze.findUnique.mockResolvedValue(null);
    db().economyLedger.findMany.mockResolvedValue([]);

    const state = await getEconomy("u1");

    expect(state).toMatchObject({ coins: 0, lifetimeEarned: 0, points: 0, level: 1, freezes: 0 });
    expect(state.recent).toEqual([]);
  });

  it("maps an unknown currency to coin and falls back to the raw reason", async () => {
    db().economyLedger.findMany.mockResolvedValue([
      {
        id: "x",
        currency: "weird",
        amount: -5,
        balanceAfter: 0,
        reason: "ZZZ",
        ref: null,
        createdAt: new Date(),
      },
    ]);

    const rows = await getLedger("u1");

    expect(rows[0].currency).toBe("coin");
    expect(rows[0].label).toBe("ZZZ");
  });
});
