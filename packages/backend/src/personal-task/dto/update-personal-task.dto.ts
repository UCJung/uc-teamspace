import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsObject,
  IsInt,
  Min,
} from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class UpdatePersonalTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

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

  @IsOptional()
  @IsString()
  teamId?: string;

  // statusId: TaskStatusDef FK (replaces old TaskStatus enum)
  // Full migration handled in TASK-03
  @IsOptional()
  @IsString()
  statusId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedMinutes?: number;
}
