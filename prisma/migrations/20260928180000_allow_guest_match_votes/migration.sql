-- Allow guests to vote in bracket matches, mirroring CharacterTournamentPollVote.
--
-- CharacterTournamentVote.userId was NOT NULL with a required `user` relation, so
-- bracket voting was structurally limited to logged-in accounts even though the
-- qualifying poll had always accepted an anonymous device id. Voting in the two
-- phases now works the same way.
--
-- Postgres treats NULLs as distinct in a unique index, so the two partial unique
-- indexes below coexist: many guest rows (userId IS NULL) and one row per account.

-- Drop the old foreign key + NOT NULL before widening the column.
ALTER TABLE "CharacterTournamentVote" DROP CONSTRAINT IF EXISTS "CharacterTournamentVote_userId_fkey";
ALTER TABLE "CharacterTournamentVote" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "CharacterTournamentVote" ADD COLUMN IF NOT EXISTS "deviceId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "CharacterTournamentVote_matchId_deviceId_key"
  ON "CharacterTournamentVote" ("matchId", "deviceId");

CREATE INDEX IF NOT EXISTS "CharacterTournamentVote_deviceId_idx"
  ON "CharacterTournamentVote" ("deviceId");

-- Re-add the user FK as optional (ON DELETE CASCADE, matching the poll-vote model).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CharacterTournamentVote_userId_fkey'
  ) THEN
    ALTER TABLE "CharacterTournamentVote"
      ADD CONSTRAINT "CharacterTournamentVote_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
