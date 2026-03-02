import { IsString, IsEnum, IsOptional, Matches, ValidateIf } from 'class-validator';
import { SummaryScope } from '@prisma/client';

export class CreateSummaryDto {
  @IsEnum(SummaryScope)
  scope: SummaryScope;

  @ValidateIf((o) => o.scope === 'PART')
  @IsString()
  partId?: string;

  @ValidateIf((o) => o.scope === 'TEAM')
  @IsString()
  teamId?: string;

  @IsString()
  @Matches(/^\d{4}-W\d{2}$/, { message: 'weekLabel 형식이 올바르지 않습니다. 예: 2026-W09' })
  weekLabel: string;

  @IsOptional()
  @IsString()
  title?: string;
}
