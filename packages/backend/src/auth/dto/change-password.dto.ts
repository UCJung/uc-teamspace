import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호는 필수입니다.' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: '새 비밀번호는 필수입니다.' })
  @MinLength(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(100, { message: '새 비밀번호는 100자 이내여야 합니다.' })
  newPassword: string;
}
