-- Coins economy: a spendable balance plus an append-only ledger for every
-- coin *and* XP movement.
--
-- CoinWallet mirrors `UserPoints` (the XP balance already exists) but for the
-- new spendable currency. EconomyLedger is the audit trail both halves share:
-- UserPoints/CoinWallet are derived balances, a ledger row is the record of
-- what happened and what the balance became right after. `dedupeKey` is
-- idempotency — a retried daily claim or a replayed reward cannot double-award
-- because the second insert hits the unique index.

-- CreateTable
CREATE TABLE IF NOT EXISTS "CoinWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EconomyLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "ref" TEXT,
    "dedupeKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomyLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CoinWallet_userId_key" ON "CoinWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EconomyLedger_dedupeKey_key" ON "EconomyLedger"("dedupeKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EconomyLedger_userId_createdAt_idx" ON "EconomyLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EconomyLedger_currency_createdAt_idx" ON "EconomyLedger"("currency", "createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CoinWallet_userId_fkey'
  ) THEN
    ALTER TABLE "CoinWallet"
      ADD CONSTRAINT "CoinWallet_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'EconomyLedger_userId_fkey'
  ) THEN
    ALTER TABLE "EconomyLedger"
      ADD CONSTRAINT "EconomyLedger_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
