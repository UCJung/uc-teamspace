-- DropForeignKey
ALTER TABLE "work_items" DROP CONSTRAINT "work_items_projectId_fkey";

-- AlterTable
ALTER TABLE "work_items" ALTER COLUMN "projectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
