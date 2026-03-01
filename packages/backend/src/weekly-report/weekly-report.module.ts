import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { PartSummaryController } from './part-summary.controller';
import { ReportService } from './report.service';
import { WorkItemService } from './work-item.service';
import { CarryForwardService } from './carry-forward.service';
import { PartSummaryService } from './part-summary.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReportController, PartSummaryController],
  providers: [ReportService, WorkItemService, CarryForwardService, PartSummaryService],
  exports: [ReportService, WorkItemService, PartSummaryService],
})
export class WeeklyReportModule {}
