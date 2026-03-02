import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class MergeRowsDto {
  @IsArray()
  @ArrayMinSize(2, { message: '병합하려면 최소 2개 항목이 필요합니다.' })
  @IsString({ each: true })
  summaryWorkItemIds: string[];
}
