import { IsArray, IsString } from 'class-validator';

export class ReorderMembersDto {
  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}
