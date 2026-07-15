import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad request. Usually caused by missing or invalid fields.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          path: '/api/v1/example',
          timestamp: '2026-07-15T16:20:25.264Z',
          error: {
            message: ['email must be an email'],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description:
        'Unauthorized. Provide a valid bearer token for protected endpoints.',
    }),
    ApiForbiddenResponse({
      description: 'Forbidden. Your account role cannot perform this action.',
    }),
    ApiNotFoundResponse({
      description: 'Not found. The requested route or resource does not exist.',
    }),
    ApiInternalServerErrorResponse({
      description: 'Unexpected server error.',
    }),
  );
}
