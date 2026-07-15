import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGalleryAlbumDto {
  @IsString() title!: string;
  @IsString() slug!: string;
  @IsString() categoryId!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() year?: number;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
}
