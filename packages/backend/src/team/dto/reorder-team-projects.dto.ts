import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class ReorderTeamProjectsDto {
  @IsArray()
  @ArrayMinSize(1, { message: '최소 1개 이상의 TeamProject ID가 필요합니다.' })
  @IsString({ each: true })
  orderedIds: string[];
}
