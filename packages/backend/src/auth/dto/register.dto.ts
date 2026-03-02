import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: '성명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '성명은 필수입니다.' })
  @MaxLength(50, { message: '성명은 50자 이내여야 합니다.' })
  name: string;

  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일은 필수입니다.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(100, { message: '비밀번호는 100자 이내여야 합니다.' })
  password: string;
}
