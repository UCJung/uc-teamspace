import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export enum ExportType {
  PART = 'part',
  TEAM = 'team',
}

export class ExportQueryDto {
  @IsEnum(ExportType, { message: 'type은 part 또는 team 이어야 합니다.' })
  type: ExportType;

  @IsOptional()
  @IsString()
  partId?: string;

  @IsString()
  @Matches(/^\d{4}-W\d{2}$/, { message: 'week 형식이 올바르지 않습니다. 예: 2026-W09' })
  week: string;

  @IsOptional()
  @IsString()
  teamId?: string;
}
