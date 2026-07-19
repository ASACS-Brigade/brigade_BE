import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic() {
    const settings = await this.prisma.siteSetting.findMany({
      where: { public: true },
      orderBy: { key: 'asc' },
    });

    return settings.reduce<Record<string, string>>(
      (publicSettings, setting) => {
        publicSettings[setting.key] = setting.value;
        return publicSettings;
      },
      {},
    );
  }

  findAll() {
    return this.prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }

  upsert(dto: UpsertSettingDto) {
    return this.prisma.siteSetting.upsert({
      where: { key: dto.key },
      update: { value: dto.value, public: dto.public ?? false },
      create: { key: dto.key, value: dto.value, public: dto.public ?? false },
    });
  }
}
