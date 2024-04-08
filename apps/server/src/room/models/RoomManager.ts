import type { JoinDto } from '../dto/join.dto';
import { Room } from './Room';
import { User } from './User';

export default class RoomManager {
  rooms = new Map<string, Room>();

  join(roomId: string, userId: string, joinDto: JoinDto) {
    const hasRoom = this.rooms.has(roomId);
    const user = new User(userId, hasRoom ? false : true);

    const room = hasRoom
      ? this.rooms.get(roomId)
      : new Room(roomId, joinDto.autoClose);

    if (hasRoom === false) {
      this.rooms.set(roomId, room);
    }

    room.users.set(userId, user);

    return user;
  }

  getRoomUsers(roomId: string) {
    return this.rooms.get(roomId).users;
  }
}
