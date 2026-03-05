import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreatePersonalTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIUM;

  // statusId: TaskStatusDef FK — 미입력 시 팀의 기본 BEFORE_START 상태 자동 배정
  @IsOptional()
  @IsString()
  statusId?: string;

  // ISO 8601 날짜 또는 datetime 허용
  // 예: "2026-03-05" (날짜만) 또는 "2026-03-05T14:00:00.000Z" (시간 포함)
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  // ISO 8601 날짜 또는 datetime 허용
  // 예: "2026-03-05" (날짜만) 또는 "2026-03-05T14:00:00.000Z" (시간 포함)
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsObject()
  repeatConfig?: Record<string, unknown>;

  @IsString()
  @IsNotEmpty()
  teamId: string;
}
