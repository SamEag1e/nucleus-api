import { createApp } from './app'; // This must be at top

const start = async () => {
  const cacheService = getCacheService();
  const configService = getConfigService();
  const logger = getLogger();
  const mongoService = getMongoService();

  try {
    cacheService.connect(
      configService.redisHost,
      configService.redisPort,
      configService.redisPassword
    );
    await mongoService.connect(configService.mongoUri);

    // const fileLogTransport = createFileTransport();
    // logger.addTransport(fileLogTransport);

    const app = createApp({ isDev: configService.isDev });

    const PORT = configService.port;
    app.listen(PORT, () => {
      logger.info(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
