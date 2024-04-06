import { Global, Logger, Module } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const logger = new Logger(RedisModule.name);

        const client = createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });
        await client.connect();

        logger.log('Redis Connected');
        return client;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
