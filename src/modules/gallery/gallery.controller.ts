import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses } from '../../common/swagger/api-error-responses.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateGalleryAlbumDto } from './dto/create-gallery-album.dto';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { GalleryService } from './gallery.service';
import { UpdateGalleryAlbumDto } from './dto/update-gallery-album.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';

@ApiTags('Gallery')
@ApiErrorResponses()
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Public()
  @Get('categories')
  findCategories() {
    return this.galleryService.findCategories();
  }

  @Public()
  @Get('albums')
  findAlbums(
    @Query() query: PaginationQueryDto,
    @Query('category') category?: string,
  ) {
    return this.galleryService.findAlbums(query, category);
  }

  @Public()
  @Get('albums/:slug')
  findAlbum(@Param('slug') slug: string) {
    return this.galleryService.findAlbum(slug);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @Post('categories')
  createCategory(@Body() dto: CreateGalleryCategoryDto) {
    return this.galleryService.createCategory(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateGalleryCategoryDto,
  ) {
    return this.galleryService.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.galleryService.removeCategory(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @Post('albums')
  createAlbum(@Body() dto: CreateGalleryAlbumDto) {
    return this.galleryService.createAlbum(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @Patch('albums/:id')
  updateAlbum(@Param('id') id: string, @Body() dto: UpdateGalleryAlbumDto) {
    return this.galleryService.updateAlbum(id, dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('albums/:id')
  removeAlbum(@Param('id') id: string) {
    return this.galleryService.removeAlbum(id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR)
  @Post('images')
  createImage(@Body() dto: CreateGalleryImageDto) {
    return this.galleryService.createImage(dto);
  }

  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Delete('images/:id')
  removeImage(@Param('id') id: string) {
    return this.galleryService.removeImage(id);
  }
}
