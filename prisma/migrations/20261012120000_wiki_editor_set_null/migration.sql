-- Wiki editor references no longer prevent account deletion.
--
-- The datasource uses relationMode = "prisma", so there are NO database-level
-- foreign keys: referential actions (SetNull here) are emulated by the Prisma
-- client. Deleting a User therefore sets WikiPage.lastEditorId /
-- WikiPageHistory.editorId to NULL (content and audit history survive) instead
-- of the previous RESTRICT — which made `account/delete` fail for any wiki
-- editor. This migration only relaxes the NOT NULL constraints; no FK
-- statements are needed (and none exist in this database).

-- AlterTable
ALTER TABLE "WikiPage" ALTER COLUMN "lastEditorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WikiPageHistory" ALTER COLUMN "editorId" DROP NOT NULL;