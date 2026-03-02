import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { HttpException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    try {
      const member = await this.authService.validateMember(email, password);
      if (!member) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
      return member;
    } catch (err) {
      // BusinessException(HttpException) 은 그대로 전파 (계정 상태 관련 에러)
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  }
}
