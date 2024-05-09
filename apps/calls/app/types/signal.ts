import type { ResourceID } from "@/models/P2PConnection";
import type { ServerMessage } from "./message";

export interface User {
  id: string;
  name: string;
  joined: boolean;
  raisedHand: boolean;
  tracks: {
    video?: ResourceID;
    audio?: ResourceID;
    screen?: ResourceID;
    videoEnabled: boolean;
    audioEnabled: boolean;
    screenShareEnabled: boolean;
  };
}

export interface Session {
  id: string;
  socket?: WebSocket;

  timeId?: NodeJS.Timer;

  messages: ServerMessage[];
  user: User;
}
