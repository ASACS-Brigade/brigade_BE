import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      service: 'bgb-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
