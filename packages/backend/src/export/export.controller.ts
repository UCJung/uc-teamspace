import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { MemberRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ExcelService } from './excel.service';
import { ExportQueryDto } from './dto/export-query.dto';

@Controller('api/v1/export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  constructor(private excelService: ExcelService) {}

  @Get('excel')
  @Roles(MemberRole.LEADER, MemberRole.PART_LEADER)
  async downloadExcel(@Query() query: ExportQueryDto, @Res() res: Response) {
    const { buffer, filename } = await this.excelService.generateExcel(query);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.end(buffer);
  }
}
