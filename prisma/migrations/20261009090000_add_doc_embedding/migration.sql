-- CreateExtension
-- Requires superuser on most hosts; on Supabase `vector` is in the allow-list so
-- this applies from the dashboard or a normal migration run. If this line fails
-- the rest of the migration is skipped, which is the correct failure mode: the
-- DocEmbedding table is meaningless without real vector columns.
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "DocEmbedding" (
    "source" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "snippet" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL,
    "dims" INTEGER NOT NULL,
    "embedding" vector(768),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocEmbedding_pkey" PRIMARY KEY ("source","docId")
);

-- CreateIndex
-- HNSW (pgvector >= 0.5.0). Cosine ops on unit-normalised vectors: pgvector's
-- cosine *distance* is 1 - cosine similarity, which is what `<=>` returns and
-- what the query converts back to a score.
CREATE INDEX "DocEmbedding_embedding_idx" ON "DocEmbedding" USING hnsw ("embedding" vector_cosine_ops);