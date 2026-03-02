-- CreateEnum
CREATE TYPE "SummaryScope" AS ENUM ('PART', 'TEAM');

-- DropForeignKey
ALTER TABLE "part_summaries" DROP CONSTRAINT "part_summaries_partId_fkey";

-- AlterTable
ALTER TABLE "part_summaries" ADD COLUMN     "scope" "SummaryScope" NOT NULL DEFAULT 'PART',
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "partId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "summary_work_items" ADD COLUMN     "memberNames" TEXT;

-- AddForeignKey
ALTER TABLE "part_summaries" ADD CONSTRAINT "part_summaries_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "part_summaries" ADD CONSTRAINT "part_summaries_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
