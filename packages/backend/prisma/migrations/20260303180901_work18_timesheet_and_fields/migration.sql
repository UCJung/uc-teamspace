-- CreateEnum
CREATE TYPE "Position" AS ENUM ('DIRECTOR', 'GENERAL_MANAGER', 'DEPUTY_MANAGER', 'ASSISTANT_MANAGER', 'STAFF', 'PRINCIPAL_RESEARCHER', 'SENIOR_RESEARCHER', 'RESEARCHER', 'ASSOCIATE_RESEARCHER');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('WORK', 'HOLIDAY_WORK', 'ANNUAL_LEAVE', 'HALF_DAY_LEAVE', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('OFFICE', 'FIELD', 'REMOTE', 'BUSINESS_TRIP');

-- CreateEnum
CREATE TYPE "TimesheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('LEADER', 'PROJECT_MANAGER', 'ADMIN');

-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "position" "Position";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "department" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "managerId" TEXT;

-- CreateTable
CREATE TABLE "monthly_timesheets" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "status" "TimesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_entries" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "attendance" "AttendanceType" NOT NULL DEFAULT 'WORK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_work_logs" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "workType" "WorkType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheet_approvals" (
    "id" TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approvalType" "ApprovalType" NOT NULL,
    "status" "TimesheetStatus" NOT NULL DEFAULT 'DRAFT',
    "comment" TEXT,
    "approvedAt" TIMESTAMP(3),
    "autoApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monthly_timesheets_yearMonth_idx" ON "monthly_timesheets"("yearMonth");

-- CreateIndex
CREATE INDEX "monthly_timesheets_teamId_idx" ON "monthly_timesheets"("teamId");

-- CreateIndex
CREATE INDEX "monthly_timesheets_memberId_idx" ON "monthly_timesheets"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_timesheets_memberId_teamId_yearMonth_key" ON "monthly_timesheets"("memberId", "teamId", "yearMonth");

-- CreateIndex
CREATE INDEX "timesheet_entries_timesheetId_idx" ON "timesheet_entries"("timesheetId");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_entries_timesheetId_date_key" ON "timesheet_entries"("timesheetId", "date");

-- CreateIndex
CREATE INDEX "timesheet_work_logs_entryId_idx" ON "timesheet_work_logs"("entryId");

-- CreateIndex
CREATE INDEX "timesheet_work_logs_projectId_idx" ON "timesheet_work_logs"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_approvals_timesheetId_approvalType_key" ON "timesheet_approvals"("timesheetId", "approvalType");

-- CreateIndex
CREATE INDEX "part_summaries_weekStart_idx" ON "part_summaries"("weekStart");

-- CreateIndex
CREATE INDEX "summary_work_items_partSummaryId_idx" ON "summary_work_items"("partSummaryId");

-- CreateIndex
CREATE INDEX "team_join_requests_memberId_idx" ON "team_join_requests"("memberId");

-- CreateIndex
CREATE INDEX "team_join_requests_teamId_idx" ON "team_join_requests"("teamId");

-- CreateIndex
CREATE INDEX "team_memberships_memberId_idx" ON "team_memberships"("memberId");

-- CreateIndex
CREATE INDEX "team_memberships_teamId_idx" ON "team_memberships"("teamId");

-- CreateIndex
CREATE INDEX "weekly_reports_weekStart_idx" ON "weekly_reports"("weekStart");

-- CreateIndex
CREATE INDEX "work_items_weeklyReportId_idx" ON "work_items"("weeklyReportId");

-- CreateIndex
CREATE INDEX "work_items_projectId_idx" ON "work_items"("projectId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_timesheets" ADD CONSTRAINT "monthly_timesheets_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_timesheets" ADD CONSTRAINT "monthly_timesheets_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_entries" ADD CONSTRAINT "timesheet_entries_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "monthly_timesheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_work_logs" ADD CONSTRAINT "timesheet_work_logs_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "timesheet_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_work_logs" ADD CONSTRAINT "timesheet_work_logs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_approvals" ADD CONSTRAINT "timesheet_approvals_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "monthly_timesheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheet_approvals" ADD CONSTRAINT "timesheet_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
