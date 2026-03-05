-- AlterTable
ALTER TABLE "personal_tasks" ADD COLUMN     "scheduledDate" DATE;

-- CreateIndex
CREATE INDEX "personal_tasks_memberId_teamId_scheduledDate_idx" ON "personal_tasks"("memberId", "teamId", "scheduledDate");
