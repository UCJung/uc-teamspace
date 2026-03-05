import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { TaskPriority, TaskStatusCategory } from '@prisma/client';

export enum TaskPeriodFilter {
  TODAY = 'today',
  THIS_WEEK = 'this-week',
  THIS_MONTH = 'this-month',
  OVERDUE = 'overdue',
}

export enum TaskSortBy {
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  CREATED_AT = 'createdAt',
  PROJECT = 'project',
  SORT_ORDER = 'sortOrder',
}

export class ListPersonalTasksQueryDto {
  @IsString()
  @IsNotEmpty()
  teamId: string;

  /** 특정 TaskStatusDef id로 필터 */
  @IsOptional()
  @IsString()
  statusId?: string;

  /** TaskStatusDef 카테고리로 필터 (BEFORE_START / IN_PROGRESS / COMPLETED) */
  @IsOptional()
  @IsEnum(TaskStatusCategory)
  category?: TaskStatusCategory;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskPeriodFilter)
  period?: TaskPeriodFilter;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(TaskSortBy)
  sortBy?: TaskSortBy = TaskSortBy.SORT_ORDER;
}
