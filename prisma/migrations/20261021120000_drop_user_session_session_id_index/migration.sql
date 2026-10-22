-- DropIndex
-- `UserSession.sessionId` is declared `@unique`, so Postgres already maintains
-- a unique B-tree index for it (`UserSession_sessionId_key`). The schema also
-- declared `@@index([sessionId])`, which created a second, identical index
-- (`UserSession_sessionId_idx`). On a table with ~124k rows that duplicate cost
-- a meaningful slice of the 500 MB Supabase free-tier database budget, so it
-- is dropped here.
DROP INDEX IF EXISTS "UserSession_sessionId_idx";
