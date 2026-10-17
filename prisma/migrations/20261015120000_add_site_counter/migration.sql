-- Monotonic counters that survive the analytics log-prune.
--
-- The datasource uses relationMode = "prisma", so there are NO database-level
-- foreign keys and this migration needs no FK statements.
--
-- "pageviews" seeds from the rows currently retained in PageView. After this,
-- trackPageView/trackPageViewBatch increment it, so the all-time total keeps
-- growing even as pruneLogs trims the raw PageView table.

-- CreateTable
CREATE TABLE "SiteCounter" (
    "key" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteCounter_pkey" PRIMARY KEY ("key")
);

-- Seed the cumulative page-view counter with the currently retained rows.
INSERT INTO "SiteCounter" ("key", "value", "updatedAt")
SELECT 'pageviews', COUNT(*), NOW() FROM "PageView";
