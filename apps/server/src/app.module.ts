import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [RedisModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
