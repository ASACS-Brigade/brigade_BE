import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactMessageDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() inquiryType?: string;
  @IsOptional() @IsString() preferredContactMethod?: string;
  @IsString() subject!: string;
  @IsString() @MinLength(10) message!: string;
}


