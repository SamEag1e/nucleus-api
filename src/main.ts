import { createApp } from './app'; // This must be at top

import logger from '@shared/logger/logger';
import { getCacheService } from '@shared/services/cache.service';
import { getConfigService } from '@shared/services/config.service';
import { getMongoService } from '@shared/services/mongo.service';

const start = async () => {
  const cacheService = getCacheService();
  const configService = getConfigService();
  const mongoService = getMongoService();

  cacheService.connect({
    host: configService.REDIS_HOST,
    port: configService.REDIS_PORT,
    pw: configService.REDIS_PASSWORD,
  });

  await mongoService.connect(configService.MONGO_URI);

  const app = createApp({ isDev: configService.isDev });

  const PORT = configService.APP_PORT;
  app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });
};

// Catch any unexpected errors outside async
start().catch((err) => {
  logger.error('Unexpected startup error:', err);
  process.exit(1);
});

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
