import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses } from '../../common/swagger/api-error-responses.decorator';
import { AuthService } from './auth.service';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { JwtPayload } from './types/jwt-payload.type';

@ApiTags('Auth')
@ApiErrorResponses()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login with admin email and password',
    description:
      'This endpoint only accepts POST. Do not open /auth/login directly in the browser because that sends GET and returns 404.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      valid: {
        summary: 'Valid login body',
        value: { email: 'admin@example.com', password: 'StrongPassword123!' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Login successful. Returns access and refresh tokens.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('bootstrap-admin')
  @ApiOperation({
    summary: 'Create the first super admin account',
    description:
      'Use this only when the database has no users. It locks after the first user exists.',
  })
  @ApiBody({
    type: BootstrapAdminDto,
    examples: {
      valid: {
        summary: 'First admin body',
        value: {
          name: 'Site Admin',
          email: 'admin@example.com',
          password: 'StrongPassword123!',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'First admin created. Returns access and refresh tokens.',
  })
  bootstrapAdmin(@Body() dto: BootstrapAdminDto) {
    return this.authService.bootstrapAdmin(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh an access token' })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      valid: {
        summary: 'Refresh token body',
        value: { refreshToken: 'paste-refresh-token-from-login-response-here' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Returns a new access token and refresh token.',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ description: 'Current authenticated user profile.' })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user);
  }
}
