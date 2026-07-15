import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGalleryImageDto {
  @IsString() url!: string;
  @IsString() albumId!: string;
  @IsOptional() @IsString() publicId?: string;
  @IsOptional() @IsString() alt?: string;
  @IsOptional() @IsString() caption?: string;
  @IsOptional() @IsInt() width?: number;
  @IsOptional() @IsInt() height?: number;
}
