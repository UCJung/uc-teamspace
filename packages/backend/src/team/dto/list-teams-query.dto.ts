import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TeamFilter {
  ALL = 'all',
  JOINED = 'joined',
  UNJOINED = 'unjoined',
}

export class ListTeamsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TeamFilter, { message: '유효한 필터 값이 아닙니다.' })
  filter?: TeamFilter = TeamFilter.ALL;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string, 10))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
