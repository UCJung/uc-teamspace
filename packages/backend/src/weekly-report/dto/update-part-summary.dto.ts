import { IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class UpdatePartSummaryDto {
  @IsOptional()
  @IsEnum(ReportStatus, { message: '유효한 상태값이 아닙니다.' })
  status?: ReportStatus;
}
