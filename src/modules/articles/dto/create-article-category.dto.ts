import { IsOptional, IsString } from 'class-validator';

export class CreateArticleCategoryDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsOptional() @IsString() description?: string;
}
