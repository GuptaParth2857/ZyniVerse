-- CreateTable
CREATE TABLE "BingoTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🎱',
    "description" TEXT,
    "squares" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BingoTemplate_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "BingoCard" ADD COLUMN "templateId" TEXT;

-- CreateIndex
CREATE INDEX "BingoTemplate_createdById_idx" ON "BingoTemplate"("createdById");

-- CreateIndex
CREATE INDEX "BingoTemplate_isActive_isFeatured_idx" ON "BingoTemplate"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "BingoCard_templateId_idx" ON "BingoCard"("templateId");

-- AddForeignKey
ALTER TABLE "BingoCard" ADD CONSTRAINT "BingoCard_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BingoTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BingoTemplate" ADD CONSTRAINT "BingoTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;