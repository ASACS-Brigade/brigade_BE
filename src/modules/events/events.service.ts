import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PublishStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.EventWhereInput = {
      status: PublishStatus.PUBLISHED,
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
      this.prisma.event.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { startsAt: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
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
    const where: Prisma.EventWhereInput = {
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
      this.prisma.event.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, status: PublishStatus.PUBLISHED },
    });
    if (!event) throw new NotFoundException('Event not found.');
    return event;
  }

  async create(dto: CreateEventDto) {
    try {
      return await this.prisma.event.create({
        data: this.mapEventDto(dto) as Prisma.EventUncheckedCreateInput,
      });
    } catch (error) {
      this.handleWriteError(error, 'Event');
    }
  }

  async update(id: string, dto: UpdateEventDto) {
    try {
      return await this.prisma.event.update({
        where: { id },
        data: this.mapEventDto(dto),
      });
    } catch (error) {
      this.handleWriteError(error, 'Event');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.event.delete({ where: { id } });
      return { deleted: true, id };
    } catch (error) {
      this.handleWriteError(error, 'Event');
    }
  }

  private mapEventDto(dto: CreateEventDto | UpdateEventDto) {
    return {
      ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
      ...(dto.slug !== undefined ? { slug: dto.slug.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
      ...(dto.content !== undefined ? { content: dto.content } : {}),
      ...(dto.startsAt !== undefined
        ? { startsAt: new Date(dto.startsAt) }
        : {}),
      ...(dto.endsAt !== undefined
        ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
        : {}),
      ...(dto.time !== undefined ? { time: dto.time } : {}),
      ...(dto.location !== undefined ? { location: dto.location.trim() } : {}),
      ...(dto.coverImageUrl !== undefined
        ? { coverImageUrl: dto.coverImageUrl }
        : {}),
      ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.galleryImageUrls !== undefined
        ? { galleryImageUrls: dto.galleryImageUrls }
        : {}),
    };
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
