import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamRequestDto {
  @IsString()
  @IsNotEmpty({ message: '팀 이름은 필수입니다.' })
  teamName: string;

  @IsOptional()
  @IsString()
  description?: string;
}
