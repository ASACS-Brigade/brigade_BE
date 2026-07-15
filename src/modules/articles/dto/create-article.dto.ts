import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PublishStatus } from '@prisma/client';

export class CreateArticleDto {
  @IsString() title!: string;
  @IsString() slug!: string;
  @IsOptional() @IsString() eyebrow?: string;
  @IsString() excerpt!: string;
  @IsOptional() @IsString() deck?: string;
  @IsString() content!: string;
  @IsString() categoryId!: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString() readTime?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsEnum(PublishStatus) status?: PublishStatus;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() sections?: unknown[];
  @IsOptional() @IsArray() timeline?: unknown[];
}
