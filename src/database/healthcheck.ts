import mongoose from 'mongoose';
import { z } from 'zod';

import '../register'; // Just to have .openapi on zod at runtime

import logger from '@shared/logger/logger';
import { getMongoService } from '@shared/services/mongo.service';
import { getConfigService } from '@shared/services/config.service';
import { transformMongoDoc } from '@shared/transformers/mongo-doc.transformer';
import { formatZodError } from '@shared/utils/error-formatter';

async function main() {
  const configService = getConfigService();
  const mongoService = getMongoService();
  await mongoService.connect(configService.MONGO_URI);

  // await checkCollection('users', userMongoModel, userZodSchema);

  await mongoService.disconnect();
  logger.info('Complete!');
}

async function checkCollection(
  name: string,
  model: mongoose.Model<any>,
  schema: z.ZodSchema<any>
) {
  const docs = await model.find().lean();
  logger.info(`[DB Health] Checking ${name} (${docs.length} docs)`);
  const transformedDocs = docs.map(transformMongoDoc);

  const invalids: { id: string; issues: string[] }[] = [];
  for (const doc of transformedDocs) {
    const result = schema.safeParse(doc);
    if (!result.success) {
      invalids.push({
        id: String((doc as any)._id),
        issues: formatZodError(result.error),
      });
    }
  }

  if (invalids.length > 0) {
    logger.info(
      `[DB Health] ${name}: Found ${invalids.length} invalid documents`
    );
    invalids.slice(0, 5).forEach((inv) => {
      logger.info(`  Doc ${inv.id}\n    ${inv.issues}`);
    });
    throw new Error(`[DB Health] ${name} collection contains invalid data`);
  }

  logger.info(`[DB Health] ${name} OK`);
}

main().catch((err) => {
  logger.error('HealthCheck failed:', err);
  process.exit(1);
});
