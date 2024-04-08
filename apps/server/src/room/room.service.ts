import { Injectable } from '@nestjs/common';

// const createKey = (...identifier: string[]) => identifier.join(':');

@Injectable()
export class RoomService {
  constructor() {}

  // async findRoomUser(roomId: string) {
  //   const key = createKey('room', 'users', roomId);
  //   const room = await this.redisService.hGetAll(key);

  //   return Object.values(room).map((data) => JSON.parse(data) as User);
  // }

  // async createRoomUser(roomId: string, createRoomUserDto: CreateRoomUserDto) {
  //   const key = createKey('room', 'users', roomId);

  //   return this.redisService.hSet(
  //     key,
  //     createRoomUserDto.id,
  //     JSON.stringify(createRoomUserDto),
  //   );
  // }

  // async updateRoomUser(
  //   roomId: string,
  //   userId: string,
  //   updateRoomUserDto: UpdateRoomUserDto,
  // ) {
  //   const key = createKey('room', 'users', roomId);
  //   const isExists = await this.redisService.hExists(key, userId);

  //   if (!isExists) return;

  //   const data = await this.redisService.hGet(key, userId);
  //   const user = JSON.parse(data) as User;

  //   user.owner = updateRoomUserDto.owner ?? user.owner;
  //   user.streaming = updateRoomUserDto.streaming ?? user.streaming;

  //   return this.redisService.hSet(key, userId, JSON.stringify(user));
  // }

  // removeRoomUser(roomId: string, userId: string) {
  //   const key = createKey('room', 'users', roomId);

  //   return this.redisService.hDel(key, userId);
  // }

  // async cleanRoomUser(roomId: string) {
  //   const key = createKey('room', 'users', roomId);
  //   const userIds = await this.redisService.hKeys(roomId);

  //   await Promise.all(userIds.map((id) => this.redisService.hDel(key, id)));

  //   return userIds;
  // }

  // createRoom(createRoomDto: CreateRoomDto) {
  //   const key = createKey('room', 'info', createRoomDto.id);

  //   return this.redisService.set(key, JSON.stringify(createRoomDto));
  // }

  // async findRoom(roomId: string) {
  //   const key = createKey('room', 'info', roomId);
  //   const room = await this.redisService.get(key);

  //   return JSON.parse(room) as Room;
  // }

  // async removeRoom(roomId: string) {
  //   const key = createKey('room', 'info', roomId);

  //   await this.redisService.del(key);
  //   await this.cleanRoomSession(roomId);
  //   await this.cleanRoomUser(roomId);
  // }

  // async createRoomSession(createSessionDto: CreateSessionDto) {
  //   const key = createKey('room', 'session', createSessionDto.roomId);
  //   const isExists = await this.redisService.hExists(
  //     key,
  //     createSessionDto.hostId,
  //   );

  //   if (isExists) {
  //     return this.updateRoomSession(createSessionDto);
  //   }

  //   return this.redisService.hSet(
  //     key,
  //     createSessionDto.hostId,
  //     JSON.stringify([createSessionDto]),
  //   );
  // }

  // async updateRoomSession(createSessionDto: CreateSessionDto) {
  //   const key = createKey('room', 'session', createSessionDto.roomId);
  //   const data = await this.redisService.hGet(key, createSessionDto.hostId);

  //   const list = JSON.parse(data) as CreateSessionDto[];

  //   list.push(createSessionDto);

  //   return this.redisService.hSet(
  //     key,
  //     createSessionDto.hostId,
  //     JSON.stringify(list),
  //   );
  // }

  // async findRoomSessionByUserId(roomId: string, userId: string) {
  //   const key = createKey('room', 'session', roomId);
  //   const data = await this.redisService.hGet(key, userId);
  //   const list = JSON.parse(data) as CreateSessionDto[];

  //   return list;
  // }

  // removeRoomSession(roomId: string, hostId: string) {
  //   const key = createKey('room', 'session', roomId);

  //   return this.redisService.hDel(key, hostId);
  // }

  // async cleanRoomSession(roomId: string) {
  //   const key = createKey('room', 'session', roomId);
  //   const hostIds = await this.redisService.hKeys(key);

  //   await Promise.all(hostIds.map((id) => this.redisService.hDel(key, id)));

  //   return hostIds;
  // }
}
