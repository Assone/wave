import type {
  ClientMessage,
  MessageFromServer,
  ServerMessage,
} from "@/types/message";
import type { Session, User } from "@/types/signal";
import { assertNonNullable } from "@/utils/assert";
import { isNull, isString, isUndefined } from "@/utils/is";
import { getUsername } from "@/utils/username";
import { DurableObject } from "cloudflare:workers";
import invariant from "tiny-invariant";
import Logger from "./Logger";

interface Env {}

const handleErrors = async <T>(
  state: DurableObjectState,
  request: Request,
  callback: () => Promise<T> | T
) => {
  try {
    return await callback();
  } catch (error) {
    if (error instanceof Error === false) throw error;

    const upgradeHeader = request.headers.get("Upgrade");

    if (upgradeHeader === "websocket") {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair) as [
        WebSocket,
        WebSocket,
      ];

      state.acceptWebSocket(server);
      server.send(
        JSON.stringify({ error: error.stack, message: error.message })
      );
      server.close(1011, "Uncaught exception during session setup");

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response(error.stack, { status: 500 });
  }
};

export class ChatRoom extends DurableObject implements DurableObject {
  state: DurableObjectState;
  storage: DurableObjectStorage;
  sessions = new Map<string, Session>();

  logger = new Logger(ChatRoom.name);

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    this.state = state;
    this.storage = state.storage;
    this.state.blockConcurrencyWhile(async () => {
      const sessions = await this.storage.get<Session[]>("sessions");
      sessions?.forEach((session) => this.setupHeartbeatInterval(session));

      this.sessions = new Map(
        sessions?.map((session) => [session.id, session])
      );
    });
  }

  override fetch(request: Request): Response | Promise<Response> {
    return handleErrors(this.state, request, () => {
      const url = new URL(request.url);

      this.logger.debug(request.url, "fetch");

      switch (url.pathname) {
        case "/websocket": {
          const upgradeHeader = request.headers.get("Upgrade");

          if (!upgradeHeader || upgradeHeader !== "websocket") {
            return new Response("Durable Object expected Upgrade: websocket", {
              status: 426,
            });
          }

          const webSocketPair = new WebSocketPair();
          const [client, server] = Object.values(webSocketPair) as [
            WebSocket,
            WebSocket,
          ];

          this.createSession(server, request);

          return new Response(null, { status: 101, webSocket: client });
        }

        default: {
          return new Response("Not found", { status: 404 });
        }
      }
    });
  }

  override webSocketClose(
    ws: WebSocket,
    code: number
    // reason: string,
    // wasClean: boolean
  ): void | Promise<void> {
    const [sid] = this.state.getTags(ws) as [string];
    this.logger.debug(sid, "webSocketClose - sessionId");

    this.sessions.delete(sid);

    ws.close(code, "Durable Object is closing WebSocket");
  }

  override webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): void | Promise<void> {
    const [sid] = this.state.getTags(ws) as [string];
    const session = this.sessions.get(sid);

    invariant(session, `Not Found Session: ${sid}`);

    try {
      const text = isString(message)
        ? message
        : new TextDecoder().decode(new Uint8Array(message));
      const data: ClientMessage = JSON.parse(text);

      switch (data.type) {
        case "leave": {
          this.leave(session);
          break;
        }

        case "updateUser": {
          this.updateUser(session, data.user);
          break;
        }

        case "heartbeat": {
          const resetHeartBeatTimeId = this.setupHeartbeatInterval(session);

          resetHeartBeatTimeId();
          break;
        }

        case "mute": {
          break;
        }
      }
    } catch (error) {
      this.logger.error(error, "message - error");
    }
  }

  setupHeartbeatInterval(session: Session) {
    const handler = () => {
      if (session.timeId) {
        clearTimeout(session.timeId);
      }

      session.timeId = setTimeout(() => {
        this.leave(session);
      }, 10000);
    };

    handler();

    return handler;
  }

  async createSession(server: WebSocket, request: Request) {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");
    const username = await getUsername(request);

    assertNonNullable(username);

    this.logger.debug(sessionId, "createSession - sessionId");

    const currentSession = isNull(sessionId)
      ? undefined
      : this.sessions.get(sessionId);
    const id = currentSession?.id ?? crypto.randomUUID();

    const session: Session = currentSession ?? {
      id,
      socket: server,
      messages: [],
      user: {
        id,
        name: username,
        joined: false,
        raisedHand: false,
        tracks: {
          videoEnabled: false,
          audioEnabled: false,
          screenShareEnabled: false,
        },
      },
    };

    this.state.acceptWebSocket(server, [id]);

    if (isUndefined(currentSession)) {
      this.sessions.set(id, session);
    } else {
      currentSession.socket = server;
      this.flushMessage(currentSession);
    }

    if (isNull(sessionId)) {
      this.send(session, { type: "identity", id });
    }

    this.syncRoomState();
    this.setupHeartbeatInterval(session);
  }

  async saveSessions() {
    const sessions = Array.from(this.sessions.values()).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ socket: _, ...data }) => data
    );

    await this.storage.put("sessions", sessions);
  }

  async send<M extends ServerMessage>(session: Session, message: M) {
    if (session.socket?.readyState === WebSocket.OPEN) {
      const data: MessageFromServer = {
        from: "server",
        timestamp: Date.now(),
        message,
      };

      session.socket.send(JSON.stringify(data));
      session.messages = session.messages.filter(
        (serverMessage) => serverMessage !== message
      );
    } else {
      session.messages.push(message);
    }

    await this.saveSessions();
  }

  flushMessage(session: Session) {
    for (const message of session.messages) {
      this.send(session, message);
    }
  }

  broadcast(message: ServerMessage) {
    this.sessions.forEach((session) => {
      this.send(session, message);
    });
  }

  syncRoomState() {
    const users = Array.from(this.sessions.values()).map(
      (session) => session.user
    );

    this.broadcast({
      type: "room",
      users,
    });
  }

  leave(session: Session) {
    this.logger.debug(session.id, "leave");
    this.sessions.delete(session.id);
    this.syncRoomState();
  }

  updateUser(session: Session, user: User) {
    session.user = user;
    this.syncRoomState();
  }
}
