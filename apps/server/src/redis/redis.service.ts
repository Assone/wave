import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  get(key: string) {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  del(key: string) {
    return this.redisClient.del(key);
  }

  async hSet(key: string, field: string, value: string | number, ttl?: number) {
    await this.redisClient.hSet(key, field, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  hGet(key: string, field: string) {
    return this.redisClient.hGet(key, field);
  }

  hDel(key: string, field: string) {
    return this.redisClient.hDel(key, field);
  }

  hGetAll(key: string) {
    return this.redisClient.hGetAll(key);
  }

  hKeys(key: string) {
    return this.redisClient.hKeys(key);
  }

  hExists(key: string, field: string) {
    return this.redisClient.hExists(key, field);
  }
}
