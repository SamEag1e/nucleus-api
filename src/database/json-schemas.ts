import logger from '@shared/logger/logger';
import { getMongoService } from '@shared/services/mongo.service';
import { getConfigService } from '@shared/services/config.service';
import { modelSource } from './model-source';

async function main() {
  const configService = getConfigService();
  const mongoService = getMongoService();

  await mongoService.connect(configService.MONGO_URI);
  const db = mongoService.instance.connection.db;
  if (!db) throw new Error("Mongo DB isn't connected properly");

  for (const data of modelSource) {
    const { collectionName, jsonSchema } = data;
    logger.info(`Making validations for ${collectionName}`);

    const collections = await db
      .listCollections({ name: collectionName })
      .toArray();
    logger.info(
      `Collections: ${collections.map((c) => c.name).join(', ') || 'none'}`
    );

    // Collection is new
    if (collections.length === 0) {
      await db.createCollection(collectionName, {
        validator: { $jsonSchema: jsonSchema },
        validationLevel: 'strict',
        validationAction: 'error',
      });
      logger.info(`${collectionName} created with validator`);
      continue;
    }

    // Collection already exists
    await db.command({
      collMod: collectionName,
      validator: { $jsonSchema: jsonSchema },
      validationLevel: 'strict',
      validationAction: 'error',
    });
    logger.info(`${collectionName} validator applied`);
  }

  await mongoService.disconnect();
  logger.info('Complete!');
}

main().catch((err) => {
  logger.error('Initializing DB failed:', err);
  process.exit(1);
});
