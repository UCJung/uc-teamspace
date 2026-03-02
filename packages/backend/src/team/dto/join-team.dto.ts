import { IsOptional, IsString } from 'class-validator';

export class JoinTeamDto {
  @IsOptional()
  @IsString()
  message?: string;
}
