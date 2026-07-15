import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactStatus, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const message = await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim(),
        subject: dto.subject.trim(),
        message: dto.message.trim(),
      },
    });

    await this.mailService.sendContactNotification({
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
    });

    return message;
  }

  async findAll(query: PaginationQueryDto, status?: ContactStatus) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.ContactMessageWhereInput = {
      ...(status ? { status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { subject: { contains: query.search, mode: 'insensitive' } },
              { message: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto) {
    try {
      return await this.prisma.contactMessage.update({
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
      throw new NotFoundException('Contact message not found.');
    }
    throw error;
  }
}
