import RoomSession from './RoomSession';
import type { User } from './User';

export class Room {
  users = new Map<string, User>();
  sessions = new Map<string, RoomSession>();

  constructor(
    public id: string,
    public closeOnOwnerLeave: boolean,
  ) {}

  get owner() {
    return Array.from(this.users.values()).find((user) => user.owner);
  }

  createSession(sid: string, hostId: string, clientId: string) {
    const roomSession = new RoomSession(hostId, clientId);

    this.sessions.set(sid, roomSession);

    return roomSession;
  }

  removeSessionByHostId(hostId: string) {
    for (const [sessionId, session] of this.sessions) {
      if (session.hostId === hostId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  removeSessionByClientId(clientId: string) {
    for (const [sessionId, session] of this.sessions) {
      if (session.clientId === clientId) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
