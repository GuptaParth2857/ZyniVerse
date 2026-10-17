-- The admin "Live Sessions & Traffic" monitor polls for currently-online
-- sessions (isActive + lastActiveAt within 5 minutes) on every refresh, which
-- previously had no covering index and fell back to a scan.

-- CreateIndex
CREATE INDEX "UserSession_isActive_lastActiveAt_idx" ON "UserSession"("isActive", "lastActiveAt");
