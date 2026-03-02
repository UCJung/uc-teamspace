import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class AddTeamProjectsDto {
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1개 이상의 프로젝트ID가 필요합니다.' })
  @IsString({ each: true })
  projectIds: string[];
}
