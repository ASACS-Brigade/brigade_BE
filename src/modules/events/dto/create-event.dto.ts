import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PublishStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString() title!: string;
  @IsString() slug!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() content?: string;
  @IsDateString() startsAt!: string;
  @IsOptional() @IsDateString() endsAt?: string;
  @IsOptional() @IsString() time?: string;
  @IsString() location!: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsEnum(PublishStatus) status?: PublishStatus;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImageUrls?: string[];
}
