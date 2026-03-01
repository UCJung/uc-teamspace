import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExcelService } from './excel.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExportController],
  providers: [ExcelService],
})
export class ExportModule {}
