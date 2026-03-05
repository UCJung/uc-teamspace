import { IsArray, IsString, IsNotEmpty, Matches, ArrayNotEmpty } from 'class-validator';

export class ImportToWeeklyReportDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  taskIds: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-W\d{2}$/, { message: 'weekLabel 형식은 "YYYY-WNN" 이어야 합니다.' })
  weekLabel: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;
}
