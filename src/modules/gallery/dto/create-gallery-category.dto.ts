import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateGalleryCategoryDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
