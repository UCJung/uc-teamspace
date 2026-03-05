-- AlterTable: Change personal_tasks."scheduledDate" and "dueDate" from DATE to TIMESTAMP(3)
ALTER TABLE "personal_tasks" ALTER COLUMN "scheduledDate" TYPE TIMESTAMP(3) USING "scheduledDate"::timestamp;
ALTER TABLE "personal_tasks" ALTER COLUMN "dueDate" TYPE TIMESTAMP(3) USING "dueDate"::timestamp;
