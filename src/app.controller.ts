import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from './common/swagger/api-error-responses.decorator';

import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@ApiErrorResponses()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  root() {
    return {
      ...this.appService.health(),
      message: 'Server is up and running.',
    };
  }

  @Public()
  @Get('health')
  health() {
    return this.appService.health();
  }
}
