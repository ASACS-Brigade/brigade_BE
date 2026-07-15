import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() subject!: string;
  @IsString() @MinLength(10) message!: string;
}
