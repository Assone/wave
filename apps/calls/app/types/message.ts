import type { User } from "./signal";

type SocketMessage<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends keyof any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<string, any> = object,
> = {
  type: T;
} & D;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMaps<T extends Record<string, any>> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [E in keyof T]: SocketMessage<E, T[E] extends void ? {} : T[E]>;
};

interface ClientEmitEvents {
  mute: never;
  leave: never;
  updateUser: { user: User };
  heartbeat: never;
}

type ClientEvents = EventMaps<ClientEmitEvents>;

export type ClientMessage = ClientEvents[keyof ClientEvents];

interface ServerEmitEvents {
  error: { stack?: string; message?: string };
  room: { users: User[] };
  identity: { id: string };
}

type ServerEvents = EventMaps<ServerEmitEvents>;

export type ServerMessage = ServerEvents[keyof ServerEvents];

export type MessageFromServer = {
  from: string;
  timestamp: number;
  message: ServerMessage;
};
