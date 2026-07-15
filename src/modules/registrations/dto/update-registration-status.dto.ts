import { IsEnum } from 'class-validator';
import { RegistrationStatus } from '@prisma/client';

export class UpdateRegistrationStatusDto {
  @IsEnum(RegistrationStatus)
  status!: RegistrationStatus;
}
