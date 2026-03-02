import { IsEnum, IsNotEmpty } from 'class-validator';
import { TeamStatus } from '@prisma/client';

export class UpdateTeamStatusDto {
  @IsEnum(TeamStatus)
  @IsNotEmpty()
  status: TeamStatus;
}
