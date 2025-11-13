import { LogLevelEnum, zodLogLevelEnum } from '@shared/enums/loglevel.enum';
import { z } from 'zod';

export const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z.enum(zodLogLevelEnum).default(LogLevelEnum.INFO),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.coerce.string().optional(),
});
