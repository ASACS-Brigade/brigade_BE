import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses } from '../../common/swagger/api-error-responses.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiErrorResponses()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  @Public() @Get('public') findPublic() {
    return this.settingsService.findPublic();
  }

  @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN) @Get() findAll() {
    return this.settingsService.findAll();
  }

  @ApiBearerAuth() @Roles(UserRole.SUPER_ADMIN) @Put() upsert(
    @Body() dto: UpsertSettingDto,
  ) {
    return this.settingsService.upsert(dto);
  }
}
