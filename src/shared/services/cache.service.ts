import Redis from 'ioredis';
import Redlock from 'redlock';

import logger from '@shared/logger/logger';

const redLockOptions = {
  retryCount: 3,
  retryDelay: 200, // ms
  retryJitter: 50, // ms
};

/**
 * A lightweight Redis-based cache and distributed lock service.
 *
 * Provides helpers for basic Redis operations (GET, SET, LIST ops, TTL, etc.)
 * and distributed locking via Redlock. Designed to be used as a singleton.
 */
class CacheService {
  private client?: Redis;
  private redlock?: Redlock;

  /**
   * Establishes a Redis connection and initializes Redlock.
   */
  connect(options: { host: string; port: number; pw?: string }): void {
    logger.info(`[Redis] Connecting to ${options.host}:${options.port} ...`);
    this.client = new Redis({
      host: options.host,
      port: options.port,
      password: options.pw,
    });
    // Initialize Redlock after Redis client is ready
    this.redlock = new Redlock([this.client], redLockOptions);

    this.client.on('connect', () => {
      logger.info('[Redis] Connected');
    });

    this.client.on('ready', () => {
      logger.debug('[Redis] Ready for commands');
    });

    this.client.on('reconnecting', (time: any) => {
      logger.debug(`[Redis] Reconnecting in ${time} ms`);
    });

    this.client.on('error', (err) => {
      logger.error('[Redis] Connection failed:', err);
    });

    this.redlock.on('clientError', (err) => {
      logger.error('Redlock client error', err);
    });
  }

  /**
   * Returns the underlying Redis instance.
   * Throws if Redis is not yet connected.
   */
  get instance(): Redis {
    return this.getClient();
  }

  /**
   * Ensures Redis client is connected before use.
   * @throws If Redis client is not connected.
   */
  private getClient(): Redis {
    if (!this.client) throw new Error('Redis client not connected');
    return this.client;
  }

  /**
   * Ensures Redlock is initialized before use.
   * @throws If Redlock is not initialized.
   */
  private getRedlock(): Redlock {
    if (!this.redlock) throw new Error('Redlock not initialized');
    return this.redlock;
  }

  /**
   * Executes a function under a distributed lock using Redlock.
   *
   * @template T
   * @param {string} key - Lock key.
   * @param {number} ttl - Lock TTL (milliseconds).
   * @param {() => Promise<T>} fn - Function to run while holding the lock.
   * @returns {Promise<T>} The return value of `fn`.
   */
  async lock<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
    const lock = await this.getRedlock().acquire([key], ttl);
    try {
      return await fn();
    } finally {
      await lock.release().catch((err) => {
        logger.error(
          `[Redis] Failed to release lock (maybe TTL expired) ${key}`,
          err
        );
      });
    }
  }

  /**
   * Stores a value in Redis with optional TTL.
   *
   * @template T
   * @param {string} key - Redis key.
   * @param {T} value - Value to store (auto-serialized).
   * @param {number | 'KEEPTTL'} [ttlSeconds] - TTL in seconds or `'KEEPTTL'` to preserve existing TTL.
   */
  async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number | 'KEEPTTL'
  ): Promise<void> {
    const redis = this.getClient();
    const data = JSON.stringify(value);

    logger.debug(
      `[Redis] SET ${key} (ttl: ${ttlSeconds ?? '∞'}) value: ${data.slice(0, 100)}${
        data.length > 100 ? '...' : ''
      }`
    );

    if (ttlSeconds === 'KEEPTTL') {
      await redis.set(key, data, 'KEEPTTL');
    } else if (typeof ttlSeconds === 'number') {
      await redis.setex(key, ttlSeconds, data);
    } else {
      await redis.set(key, data);
    }
  }

  /**
   * Get remaining TTL for a Redis key.
   *
   * @param {string} key - Redis key.
   * @returns {Promise<number>} TTL in seconds, -1 if persistent, -2 if missing.
   */
  async ttl(key: string): Promise<number> {
    const redis = this.getClient();
    logger.debug(`[Redis] TTL ${key}`);

    const ttl = await redis.ttl(key);

    logger.debug(`[Redis] TTL ${key} value: ${ttl}`);

    return ttl;
  }

  /**
   * Checks if a key exists and has a positive TTL.
   *
   * @param {string} key - Redis key to check.
   * @returns {Promise<boolean>} True if key has a TTL > 0.
   */
  async hasTTL(key: string): Promise<boolean> {
    const ttl = await this.ttl(key);
    return ttl > 0;
  }

  /**
   * Retrieves and parses a JSON value from Redis.
   *
   * @template T
   * @param {string} key - Redis key.
   * @returns {Promise<T|null>} Parsed value or null if missing/invalid.
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = this.getClient();
    logger.debug(`[Redis] GET ${key}`);

    const raw = await redis.get(key);
    if (!raw) {
      logger.debug(`[Redis] MISS ${key}`);
      return null;
    }

    logger.debug(
      `[Redis] HIT ${key} value: ${raw.slice(0, 100)}${raw.length > 100 ? '...' : ''}`
    );

    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.error(`[Redis] Failed to parse JSON for ${key}`, err);
      return null;
    }
  }

  /**
   * Deletes a Redis key.
   *
   * @param {string} key - Redis key to delete.
   * @returns {Promise<number>} Number of keys deleted (0 or 1).
   */
  async del(key: string): Promise<number> {
    const redis = this.getClient();
    logger.debug(`[Redis] DEL ${key}`);
    return await redis.del(key);
  }

  /**
   * Clears all Redis keys (use carefully).
   */
  async flushAll(): Promise<void> {
    const redis = this.getClient();
    logger.debug('[Redis] FLUSHALL (clearing all keys!)');
    await redis.flushall();
  }

  /**
   * Pushes one or more elements to a Redis list (LPUSH).
   *
   * @template T
   * @param {string} key - Redis list key.
   * @param {T[]|T} values - Values to push.
   * @param {number} [ttlSeconds] - Optional TTL for the list.
   * @returns {Promise<number>} New list length.
   */
  async lpush<T>(
    key: string,
    values: T[] | T,
    ttlSeconds?: number
  ): Promise<number> {
    const redis = this.getClient();

    const list = Array.isArray(values) ? values : [values];
    const data = list.map((v) => JSON.stringify(v));

    logger.debug(
      `[Redis] LPUSH ${key} count=${data.length} (ttl: ${ttlSeconds ?? '∞'})`
    );

    const result = await redis.lpush(key, ...data);

    if (ttlSeconds) {
      await redis.expire(key, ttlSeconds);
    }

    return result;
  }

  /**
   * Returns a list of parsed elements within a range.
   *
   * @template T
   * @param {string} key - Redis list key.
   * @param {number} [start=0] - Start index.
   * @param {number} [stop=-1] - End index (inclusive).
   * @returns {Promise<T[]>} List of parsed items.
   */
  async lrange<T>(key: string, start = 0, stop = -1): Promise<T[]> {
    const redis = this.getClient();
    const rawList = await redis.lrange(key, start, stop);
    const data = rawList.map((x) => JSON.parse(x) as T);

    logger.debug(`[Redis] LRANGE ${key} data.length: ${data.length}`);

    return data;
  }

  /**
   * Trims a list to a specific range.
   *
   * @param {string} key - Redis list key.
   * @param {number} start - Start index.
   * @param {number} stop - End index.
   */
  async ltrim(key: string, start: number, stop: number): Promise<void> {
    const redis = this.getClient();
    logger.debug(`[Redis] LTRIM ${key} ${start} ${stop}`);
    await redis.ltrim(key, start, stop);
  }

  /**
   * Overwrites an element in a list at a given index (LSET).
   */
  async lset<T>(key: string, index: number, value: T): Promise<'OK'> {
    const redis = this.getClient();
    const data = JSON.stringify(value);
    logger.debug(`[Redis] LSET ${key} index=${index}`);
    return await redis.lset(key, index, data);
  }

  /**
   * Removes occurrences of a value from a Redis list.
   */
  async lrem<T>(key: string, count: number, value: T): Promise<number> {
    const redis = this.getClient();
    logger.debug(`[Redis] LREM ${key} count=${count}`);
    return await redis.lrem(key, count, JSON.stringify(value));
  }
}

let instance: CacheService | null = null;

/**
 * Returns a singleton instance of CacheService.
 */
export function getCacheService() {
  if (!instance) {
    instance = new CacheService();
  }
  return instance;
}

/**
 * Resets the CacheService singleton instance (for tests or reinit).
 */
export function resetCacheService() {
  instance = null;
}
