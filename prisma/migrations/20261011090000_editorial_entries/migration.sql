-- DB-backed editorial content (previously hardcoded static arrays).
CREATE TABLE "EditorialEntry" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditorialEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EditorialEntry_kind_slug_key" ON "EditorialEntry"("kind", "slug");

CREATE INDEX "EditorialEntry_kind_isPublished_sortOrder_idx" ON "EditorialEntry"("kind", "isPublished", "sortOrder");
