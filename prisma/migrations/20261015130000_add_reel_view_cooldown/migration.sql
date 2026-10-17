-- Repeat views from the same viewer start counting again after 24 hours.
--
-- The datasource uses relationMode = "prisma", so there are NO database-level
-- foreign keys and this migration needs no FK statements.
--
-- Views stay deduped per (reelId, viewerKey) — refresh-loops and bots still
-- can't inflate a counter — but without a cooldown a given viewer could only
-- ever contribute once for the life of a reel, so totals plateaued even while
-- traffic kept rising. Existing rows default to "now", i.e. every historical
-- viewer becomes eligible again 24h after this deploy.

-- AlterTable
ALTER TABLE "ReelView" ADD COLUMN "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
