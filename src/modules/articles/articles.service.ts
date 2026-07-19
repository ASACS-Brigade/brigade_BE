import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma.service';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.ArticleWhereInput = {
      status: PublishStatus.PUBLISHED,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { excerpt: { contains: query.search, mode: 'insensitive' } },
              { deck: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllForAdmin(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const skip = (page - 1) * limit;
    const where: Prisma.ArticleWhereInput = {
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { excerpt: { contains: query.search, mode: 'insensitive' } },
              { deck: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, status: PublishStatus.PUBLISHED },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!article) throw new NotFoundException('Article not found.');
    return article;
  }

  async findCategories() {
    return this.prisma.articleCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async createCategory(dto: CreateArticleCategoryDto) {
    try {
      return await this.prisma.articleCategory.create({ data: dto });
    } catch (error) {
      this.handleWriteError(error, 'Article category');
    }
  }

  async updateCategory(id: string, dto: UpdateArticleCategoryDto) {
    try {
      return await this.prisma.articleCategory.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handleWriteError(error, 'Article category');
    }
  }

  async removeCategory(id: string, moveToCategoryId?: string) {
    try {
      if (moveToCategoryId) {
        if (moveToCategoryId === id) {
          throw new ConflictException(
            'Choose a different category to move articles into.',
          );
        }

        await this.prisma.$transaction([
          this.prisma.articleCategory.findUniqueOrThrow({
            where: { id: moveToCategoryId },
          }),
          this.prisma.article.updateMany({
            where: { categoryId: id },
            data: { categoryId: moveToCategoryId },
          }),
          this.prisma.articleCategory.delete({ where: { id } }),
        ]);

        return { deleted: true, id, movedToCategoryId: moveToCategoryId };
      }

      await this.prisma.$transaction([
        this.prisma.article.deleteMany({ where: { categoryId: id } }),
        this.prisma.articleCategory.delete({ where: { id } }),
      ]);

      return { deleted: true, id };
    } catch (error) {
      this.handleWriteError(error, 'Article category');
    }
  }

  async create(dto: CreateArticleDto) {
    try {
      return await this.prisma.article.create({
        data: {
          ...this.mapArticleDto(dto),
          publishedAt: dto.publishedAt
            ? new Date(dto.publishedAt)
            : dto.status === PublishStatus.PUBLISHED
              ? new Date()
              : undefined,
        } as Prisma.ArticleUncheckedCreateInput,
        include: { category: true },
      });
    } catch (error) {
      this.handleWriteError(error, 'Article');
    }
  }

  async update(id: string, dto: UpdateArticleDto) {
    try {
      return await this.prisma.article.update({
        where: { id },
        data: {
          ...this.mapArticleDto(dto),
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        },
        include: { category: true },
      });
    } catch (error) {
      this.handleWriteError(error, 'Article');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.article.delete({ where: { id } });
      return { deleted: true, id };
    } catch (error) {
      this.handleWriteError(error, 'Article');
    }
  }

  private mapArticleDto(
    dto: UpdateArticleDto | CreateArticleDto,
  ): Prisma.ArticleUncheckedCreateInput | Prisma.ArticleUncheckedUpdateInput {
    const data:
      Prisma.ArticleUncheckedCreateInput | Prisma.ArticleUncheckedUpdateInput =
      {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.slug !== undefined) data.slug = dto.slug.trim();
    if (dto.eyebrow !== undefined) data.eyebrow = dto.eyebrow?.trim();
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt.trim();
    if (dto.deck !== undefined) data.deck = dto.deck?.trim();
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.readTime !== undefined) data.readTime = dto.readTime;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.sections !== undefined)
      data.sections = dto.sections as Prisma.InputJsonValue;
    if (dto.timeline !== undefined)
      data.timeline = dto.timeline as Prisma.InputJsonValue;
    return data;
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
