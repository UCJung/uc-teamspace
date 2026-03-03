import { IsOptional, IsString } from 'class-validator';

export class CreateWorkItemDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsString()
  doneWork: string;

  @IsString()
  planWork: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
