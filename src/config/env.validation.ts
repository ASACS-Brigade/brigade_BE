type EnvConfig = Record<string, string | undefined>;

const requiredInProduction = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
] as const;

export function validateEnv(config: EnvConfig) {
  const nodeEnv = config.NODE_ENV ?? 'development';

  if (nodeEnv === 'production') {
    for (const key of requiredInProduction) {
      if (!config[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: Number(config.PORT ?? 4000),
    API_PREFIX: config.API_PREFIX ?? 'api/v1',
    JWT_ACCESS_EXPIRES_IN: config.JWT_ACCESS_EXPIRES_IN ?? '15m',
    JWT_REFRESH_EXPIRES_IN: config.JWT_REFRESH_EXPIRES_IN ?? '7d',
    CONTACT_TO_EMAIL: config.CONTACT_TO_EMAIL ?? 'bbgb.asacs@gmail.com',
    IMAGEKIT_UPLOAD_FOLDER: config.IMAGEKIT_UPLOAD_FOLDER ?? '/bgb',
  };
}
