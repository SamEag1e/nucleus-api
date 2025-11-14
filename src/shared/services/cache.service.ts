import Redis from 'ioredis';
import Redlock from 'redlock';

import logger from '@shared/logger/logger';

const redLockOptions = {
  retryCount: 3,
  retryDelay: 200, // ms
  retryJitter: 50, // ms
};

/**
 * Redis-based cache and distributed lock service.
 *
 * Provides:
 * - Basic Redis operations (GET, SET, DEL, TTL, list operations)
 * - Distributed locks via Redlock
 *
 * Notes:
 * - Designed as a singleton.
 * - Some operations may throw if Redis or Redlock are not connected.
 */
class CacheService {
  private client?: Redis;
  private redlock?: Redlock;

  /**
   * Connect to Redis and initialize Redlock.
   * Subsequent calls will reuse the same connection.
   */
  connect(options: { host: string; port: number; pw?: string }): void {
    logger.info(`[Redis] Connecting to ${options.host}:${options.port} ...`);
    this.client = new Redis({
      host: options.host,
      port: options.port,
      password: options.pw,
    });

    this.redlock = new Redlock([this.client], redLockOptions);

    this.client.on('connect', () => logger.info('[Redis] Connected'));
    this.client.on('ready', () => logger.debug('[Redis] Ready for commands'));
    this.client.on('reconnecting', (time: any) =>
      logger.debug(`[Redis] Reconnecting in ${time} ms`)
    );
    this.client.on('error', (err) =>
      logger.error('[Redis] Connection failed:', err)
    );

    this.redlock.on('clientError', (err) =>
      logger.error('Redlock client error', err)
    );
  }

  /**
   * Returns the Redis client.
   * @throws If Redis is not connected.
   */
  get instance(): Redis {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client;
  }

  /**
   * Returns the Redlock instance.
   * @throws If Redlock is not initialized.
   */
  private getRedlock(): Redlock {
    if (!this.redlock) throw new Error('Redlock not initialized');
    return this.redlock;
  }

  /**
   * Acquire a distributed lock and run a function under it.
   * If TTL expires, releasing the lock may fail.
   */
  async lock<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const lock = await this.getRedlock().acquire([key], ttl);
    try {
      return await fn();
    } finally {
      await lock.release().catch((err) => {
        logger.error(
          `[Redis] Failed to release lock (TTL may have expired) ${key}`,
          err
        );
      });
    }
  }

  /**
   * Set a key with optional TTL.
   * TTL can be a number (seconds) or 'KEEPTTL' to preserve existing TTL.
   */
  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number | 'KEEPTTL'
  ): Promise<void> {
    const redis = this.instance;
    const data = JSON.stringify(value);

    if (ttlSeconds === 'KEEPTTL') {
      await redis.set(key, data, 'KEEPTTL');
    } else if (typeof ttlSeconds === 'number') {
      await redis.setex(key, ttlSeconds, data);
    } else {
      await redis.set(key, data);
    }
  }

  /**
   * Get a parsed JSON value from Redis.
   * Returns null if key is missing or parsing fails.
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = this.instance;
    const raw = await redis.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.error(`[Redis] Failed to parse JSON for ${key}`, err);
      return null;
    }
  }

  /**
   * Delete a key.
   * @returns Number of keys deleted (0 or 1)
   */
  async del(key: string): Promise<number> {
    return await this.instance.del(key);
  }

  /**
   * Clears all keys. Use with caution.
   */
  async flushAll(): Promise<void> {
    await this.instance.flushall();
  }

  /**
   * Push one or more elements to a Redis list.
   * Optional TTL for the list.
   */
  async lpush<T>(
    key: string,
    values: T[] | T,
    ttlSeconds?: number
  ): Promise<number> {
    const redis = this.instance;
    const list = Array.isArray(values) ? values : [values];
    const data = list.map((v) => JSON.stringify(v));
    const result = await redis.lpush(key, ...data);
    if (ttlSeconds) await redis.expire(key, ttlSeconds);
    return result;
  }

  /**
   * Get a range of parsed items from a Redis list.
   */
  async lrange<T>(key: string, start = 0, stop = -1): Promise<T[]> {
    const redis = this.instance;
    const rawList = await redis.lrange(key, start, stop);
    return rawList.map((x) => JSON.parse(x) as T);
  }

  /**
   * Trim a list to a given range.
   */
  async ltrim(key: string, start: number, stop: number): Promise<void> {
    await this.instance.ltrim(key, start, stop);
  }

  /**
   * Overwrite an element in a list at a given index.
   */
  async lset<T>(key: string, index: number, value: T): Promise<'OK'> {
    return await this.instance.lset(key, index, JSON.stringify(value));
  }

  /**
   * Remove occurrences of a value from a list.
   */
  async lrem<T>(key: string, count: number, value: T): Promise<number> {
    return await this.instance.lrem(key, count, JSON.stringify(value));
  }

  /**
   * Get TTL in seconds.
   * Returns -1 for persistent keys, -2 if key does not exist.
   */
  async ttl(key: string): Promise<number> {
    return await this.instance.ttl(key);
  }

  /**
   * Returns true if key exists and TTL > 0
   */
  async hasTTL(key: string): Promise<boolean> {
    const ttl = await this.ttl(key);
    return ttl > 0;
  }
}

let instance: CacheService | null = null;

export function getCacheService() {
  if (!instance) instance = new CacheService();
  return instance;
}

export function resetCacheService() {
  instance = null;
}
