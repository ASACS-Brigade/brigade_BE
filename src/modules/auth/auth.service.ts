import { createHash, randomUUID } from 'node:crypto';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

import { UserRole } from '../../common/enums/user-role.enum';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async bootstrapAdmin(dto: BootstrapAdminDto) {
    const existingUsers = await this.prisma.user.count();
    if (existingUsers > 0) {
      throw new ConflictException(
        'Admin bootstrap is only available before the first user is created.',
      );
    }

    const user = await this.usersService.create({
      ...dto,
      role: UserRole.SUPER_ADMIN,
    });
    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const safeUser = this.usersService.toSafeUser(user);
    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: safeUser, tokens };
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'development-refresh-secret';
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const tokenHash = this.hashRefreshToken(dto.refreshToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken?.user.active) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const safeUser = this.usersService.toSafeUser(storedToken.user);
    const tokens = await this.issueTokens({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
    });

    return {
      user: safeUser,
      tokens,
    };
  }

  async me(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user?.active) {
      throw new UnauthorizedException('Invalid access token.');
    }

    return user;
  }

  async issueTokens(payload: JwtPayload) {
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'development-access-secret';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'development-refresh-secret';
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';
    const refreshToken = this.jwtService.sign(
      { ...payload, jti: randomUUID() },
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashRefreshToken(refreshToken),
        userId: payload.sub,
        expiresAt: this.getExpiryDate(refreshExpiresIn),
      },
    });

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      refreshToken,
    };
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private getExpiryDate(expiresIn: string) {
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
