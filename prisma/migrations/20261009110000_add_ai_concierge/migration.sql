-- AI Concierge v2 memory: one rolling conversation per user, made of turns.
--
-- This is deliberate *memory*, not a cache. `AiCache` answers an identical
-- question identically for everyone; the concierge must answer the same
-- question differently once it knows your taste and what you just asked, so
-- these rows are never part of the shared cache and are read back as model
-- turns on the next request. `userId` is unique because the palette exposes a
-- single assistant thread rather than named sessions.

-- CreateTable
CREATE TABLE IF NOT EXISTS "AiConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "href" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AiConversation_userId_key" ON "AiConversation"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AiMessage_conversationId_createdAt_idx" ON "AiMessage"("conversationId", "createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AiConversation_userId_fkey'
  ) THEN
    ALTER TABLE "AiConversation"
      ADD CONSTRAINT "AiConversation_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AiMessage_conversationId_fkey'
  ) THEN
    ALTER TABLE "AiMessage"
      ADD CONSTRAINT "AiMessage_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
