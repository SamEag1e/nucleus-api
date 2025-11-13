import * as dotenv from 'dotenv';

import { envSchema } from '@shared/schemas/env.schema';

class ConfigService {
  public readonly APP_PORT: number;
  public readonly NODE_ENV: string;
  public readonly LOG_LEVEL: string;
  public readonly MONGO_URI: string;
  public readonly REDIS_HOST: string;
  public readonly REDIS_PORT: number;
  public readonly REDIS_PASSWORD?: string;

  constructor() {
    const env = this._getEnv();

    this.APP_PORT = env.APP_PORT;
    this.NODE_ENV = env.NODE_ENV;
    this.LOG_LEVEL = env.LOG_LEVEL;
    this.MONGO_URI = env.MONGO_URI;
    this.REDIS_HOST = env.REDIS_HOST;
    this.REDIS_PORT = env.REDIS_PORT;
    this.REDIS_PASSWORD = env.REDIS_PASSWORD;
  }

  private _getEnv() {
    dotenv.config({ path: '.env' });

    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
      throw new Error(
        '[Config] Invalid environment variables:\n' + parsed.error
      );
    }

    return parsed.data;
  }

  public get isProd() {
    return this.NODE_ENV === 'production';
  }

  public get isDev() {
    return this.NODE_ENV === 'development';
  }
}

let instance: ConfigService | null = null;

export function getConfigService() {
  if (!instance) {
    instance = new ConfigService();
  }
  return instance;
}

export function resetConfigService() {
  instance = null;
}
