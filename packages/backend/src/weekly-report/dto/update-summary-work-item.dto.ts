import { IsOptional, IsString } from 'class-validator';

export class UpdateSummaryWorkItemDto {
  @IsOptional()
  @IsString()
  doneWork?: string;

  @IsOptional()
  @IsString()
  planWork?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
