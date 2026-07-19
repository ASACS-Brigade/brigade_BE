import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma.service';
import { CreateGalleryAlbumDto } from './dto/create-gallery-album.dto';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryAlbumDto } from './dto/update-gallery-album.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  findCategories() {
    return this.prisma.galleryCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        albums: {
          orderBy: [{ year: 'desc' }, { title: 'asc' }],
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            year: true,
            coverImageUrl: true,
            featured: true,
            _count: { select: { images: true } },
          },
        },
      },
    });
  }

  async findAlbums(query: PaginationQueryDto, categorySlug?: string) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.GalleryAlbumWhereInput = {
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.galleryAlbum.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { year: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          category: true,
          _count: { select: { images: true } },
        },
      }),
      this.prisma.galleryAlbum.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAlbum(slug: string) {
    const album = await this.prisma.galleryAlbum.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!album) throw new NotFoundException('Gallery album not found.');
    return album;
  }

  async createCategory(dto: CreateGalleryCategoryDto) {
    try {
      return await this.prisma.galleryCategory.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug.trim(),
          description: dto.description?.trim(),
          coverImageUrl: dto.coverImageUrl,
          sortOrder: dto.sortOrder ?? 0,
        },
      });
    } catch (error) {
      this.handleWriteError(error, 'Gallery category');
    }
  }

  async updateCategory(id: string, dto: UpdateGalleryCategoryDto) {
    try {
      return await this.prisma.galleryCategory.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description?.trim() }
            : {}),
          ...(dto.coverImageUrl !== undefined
            ? { coverImageUrl: dto.coverImageUrl }
            : {}),
          ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        },
      });
    } catch (error) {
      this.handleWriteError(error, 'Gallery category');
    }
  }

  async removeCategory(id: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const albums = await tx.galleryAlbum.findMany({
          where: { categoryId: id },
          select: { id: true },
        });

        await tx.galleryImage.deleteMany({
          where: { albumId: { in: albums.map((album) => album.id) } },
        });
        await tx.galleryAlbum.deleteMany({ where: { categoryId: id } });
        await tx.galleryCategory.delete({ where: { id } });
      });

      return { deleted: true, id };
    } catch (error) {
      this.handleWriteError(error, 'Gallery category');
    }
  }

  async createAlbum(dto: CreateGalleryAlbumDto) {
    try {
      return await this.prisma.galleryAlbum.create({
        data: {
          title: dto.title.trim(),
          slug: dto.slug.trim(),
          description: dto.description?.trim(),
          year: dto.year,
          coverImageUrl: dto.coverImageUrl,
          featured: dto.featured ?? false,
          categoryId: dto.categoryId,
        },
        include: { category: true },
      });
    } catch (error) {
      this.handleWriteError(error, 'Gallery album');
    }
  }

  async updateAlbum(id: string, dto: UpdateGalleryAlbumDto) {
    try {
      return await this.prisma.galleryAlbum.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description?.trim() }
            : {}),
          ...(dto.year !== undefined ? { year: dto.year } : {}),
          ...(dto.coverImageUrl !== undefined
            ? { coverImageUrl: dto.coverImageUrl }
            : {}),
          ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId }
            : {}),
        },
        include: { category: true, _count: { select: { images: true } } },
      });
    } catch (error) {
      this.handleWriteError(error, 'Gallery album');
    }
  }

  async removeAlbum(id: string) {
    try {
      await this.prisma.galleryAlbum.delete({ where: { id } });
      return { deleted: true, id };
    } catch (error) {
      this.handleWriteError(error, 'Gallery album');
    }
  }

  async createImage(dto: CreateGalleryImageDto) {
    try {
      return await this.prisma.galleryImage.create({
        data: {
          url: dto.url,
          publicId: dto.publicId,
          alt: dto.alt?.trim(),
          caption: dto.caption?.trim(),
          width: dto.width,
          height: dto.height,
          albumId: dto.albumId,
        },
      });
    } catch (error) {
      this.handleWriteError(error, 'Gallery image');
    }
  }

  async removeImage(id: string) {
    try {
      await this.prisma.galleryImage.delete({ where: { id } });
      return { deleted: true, id };
    } catch (error) {
      this.handleWriteError(error, 'Gallery image');
    }
  }

  private handleWriteError(error: unknown, label: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new ConflictException(`${label} already exists.`);
      if (error.code === 'P2025')
        throw new NotFoundException(`${label} not found.`);
    }
    throw error;
  }
}
