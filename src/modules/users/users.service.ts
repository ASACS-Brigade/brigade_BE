import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'bcryptjs';

import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => this.toSafeUser(user));
  }

  async create(dto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: this.normalizeEmail(dto.email),
          passwordHash: await hash(dto.password, 12),
          role: dto.role,
        },
      });

      return this.toSafeUser(user);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.email !== undefined) data.email = this.normalizeEmail(dto.email);
    if (dto.password !== undefined)
      data.passwordHash = await hash(dto.password, 12);
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.active !== undefined) data.active = dto.active;

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      return this.toSafeUser(user);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toSafeUser(user) : null;
  }

  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private handlePrismaWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists.');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
    }

    throw error;
  }
}
