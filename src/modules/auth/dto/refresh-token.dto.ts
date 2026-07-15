import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'paste-refresh-token-from-login-response-here' })
  @IsString()
  refreshToken!: string;
}
