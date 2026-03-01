import { IsString, Matches } from 'class-validator';

export class PartWeeklyStatusQueryDto {
  @IsString()
  @Matches(/^\d{4}-W\d{2}$/, { message: 'week 형식이 올바르지 않습니다. 예: 2026-W09' })
  week: string;
}
