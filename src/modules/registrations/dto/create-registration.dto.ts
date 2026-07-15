import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateRegistrationDto {
  @IsString() childName!: string;
  @IsString() parentName!: string;
  @IsEmail() parentEmail!: string;
  @IsString() parentPhone!: string;
  @IsString() ageGroup!: string;
  @IsOptional() @IsString() message?: string;
}
