import config from 'config';
import { createClient } from 'redis';

const redisUrl = config.get<string>('App.cache.redisUrl');

export const redisClient = createClient({
  url: redisUrl,
});

export type RedisClientConnection = ReturnType<typeof createClient>;
