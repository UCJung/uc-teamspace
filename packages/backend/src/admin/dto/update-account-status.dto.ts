import { IsEnum, IsNotEmpty } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class UpdateAccountStatusDto {
  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;
}
