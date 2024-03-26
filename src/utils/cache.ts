import { RedisClientConnection, redisClient } from '@src/cache/redis';
import { Price } from '@src/clients/brapi';
import config from 'config';

class CacheUtil {
  constructor(protected cacheService: RedisClientConnection = redisClient) {}

  public async connect() {
    await this.cacheService.connect();
  }

  public async close() {
    await this.cacheService.disconnect();
  }

  public async get(key: string): Promise<Price | null> {
    const cachedValue = await this.cacheService.get(key);

    if (cachedValue) {
      return JSON.parse(cachedValue);
    } else {
      return null;
    }
  }

  public async set<T>(key: string, value: T): Promise<void> {
    await this.cacheService.set(key, JSON.stringify(value), {
      EX: config.get('App.cache.TTL'),
    });
  }

  public async clear(): Promise<void> {
    await this.cacheService.flushDb();
  }
}

export default new CacheUtil();
