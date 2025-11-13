import mongoose from 'mongoose';

import logger from '@shared/logger/logger';

class MongoService {
  async connect(mongoUri: string): Promise<void> {
    try {
      await mongoose.connect(mongoUri);
      logger.info('[Mongo] Connected');
    } catch (error) {
      throw new Error(`[Mongo] Connection failed: ${error}`);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    logger.info('[Mongo] Disconnected');
  }

  get instance() {
    return mongoose;
  }
}

let instance: MongoService | null = null;

export function getMongoService() {
  if (!instance) {
    instance = new MongoService();
  }
  return instance;
}

export function resetMongoService() {
  instance = null;
}
