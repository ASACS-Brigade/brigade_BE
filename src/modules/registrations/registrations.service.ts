import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RegistrationStatus } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationStatusDto } from './dto/update-registration-status.dto';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRegistrationDto) {
    return this.prisma.registration.create({
      data: {
        childName: dto.childName.trim(),
        parentName: dto.parentName.trim(),
        parentEmail: dto.parentEmail.trim().toLowerCase(),
        parentPhone: dto.parentPhone.trim(),
        ageGroup: dto.ageGroup.trim(),
        message: dto.message?.trim(),
      },
    });
  }

  async findAll(query: PaginationQueryDto, status?: RegistrationStatus) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.RegistrationWhereInput = {
      ...(status ? { status } : {}),
      ...(query.search
        ? {
            OR: [
              { childName: { contains: query.search, mode: 'insensitive' } },
              { parentName: { contains: query.search, mode: 'insensitive' } },
              { parentEmail: { contains: query.search, mode: 'insensitive' } },
              { parentPhone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.registration.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, dto: UpdateRegistrationStatusDto) {
    try {
      return await this.prisma.registration.update({
        where: { id },
        data: { status: dto.status },
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  private handleWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Registration not found.');
    }
    throw error;
  }
}
