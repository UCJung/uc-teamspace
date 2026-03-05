-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "personal_tasks" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "memo" TEXT,
    "projectId" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" DATE,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "linkedWeekLabel" TEXT,
    "repeatConfig" JSONB,
    "completedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_tasks_memberId_teamId_idx" ON "personal_tasks"("memberId", "teamId");

-- CreateIndex
CREATE INDEX "personal_tasks_memberId_teamId_status_idx" ON "personal_tasks"("memberId", "teamId", "status");

-- CreateIndex
CREATE INDEX "personal_tasks_memberId_teamId_dueDate_idx" ON "personal_tasks"("memberId", "teamId", "dueDate");

-- CreateIndex
CREATE INDEX "personal_tasks_projectId_idx" ON "personal_tasks"("projectId");

-- AddForeignKey
ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_tasks" ADD CONSTRAINT "personal_tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
