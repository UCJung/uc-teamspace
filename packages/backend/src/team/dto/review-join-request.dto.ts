import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JoinRequestStatus } from '@prisma/client';

export class ReviewJoinRequestDto {
  @IsEnum(JoinRequestStatus, { message: '유효한 상태가 아닙니다.' })
  @IsNotEmpty({ message: '상태는 필수입니다.' })
  status: JoinRequestStatus;

  @IsOptional()
  @IsString()
  partId?: string;
}
