-- CreateTable
CREATE TABLE "ReelView" (
    "id" TEXT NOT NULL,
    "reelId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReelView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReelView_reelId_viewerKey_key" ON "ReelView"("reelId", "viewerKey");

-- CreateIndex
CREATE INDEX "ReelView_reelId_idx" ON "ReelView"("reelId");

-- Reset inflated view counts; unique-view tracking starts fresh
UPDATE "Reel" SET "views" = 0;
