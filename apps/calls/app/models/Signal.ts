import type { ClientMessage, MessageFromServer } from "@/types/message";
import { noop } from "@/utils/helper";
import { isClient, isUndefined } from "@/utils/is";
import Logger from "./Logger";
import Queue from "./Queue";

type SignalEvents = {
  error: Event;
  message: CustomEvent<MessageFromServer>;
  connected: Event;
};

type EventListener<T extends keyof SignalEvents> = (
  event: SignalEvents[T],
) => void;

export default class Signal {
  private eventTarget = new EventTarget();

  private socket?: WebSocket;

  private queue = new Queue<ClientMessage>();

  private destroyed = false;

  private reconnectTimeId?: NodeJS.Timeout;

  private id?: string;

  private logger = new Logger(Signal.name);

  private unRegisterListener = noop;
  private heartbeatTimeId?: NodeJS.Timer;

  constructor(private roomName: string) {
    if (isClient) {
      window.addEventListener("online", this.connect);
      window.addEventListener("beforeunload", this.leave);
    }
  }

  get isCanReconnect() {
    return this.destroyed === false && navigator.onLine;
  }

  destroy() {
    window.removeEventListener("online", this.connect);
    window.removeEventListener("beforeunload", this.leave);

    this.destroyed = true;
    this.leave();

    clearInterval(this.heartbeatTimeId);
    this.unRegisterListener();
    this.socket?.close();
  }

  send(message: ClientMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.logger.debug(message, "send");

      this.socket.send(JSON.stringify(message));
    } else {
      this.queue.enqueue(message);
    }
  }

  private flushQueue() {
    for (const message of this.queue) {
      this.send(message);
    }

    this.queue.clean();
  }

  private registerListener(socket: WebSocket) {
    const onOpenListener = () => {
      this.eventTarget.dispatchEvent(new CustomEvent("connected"));
      this.flushQueue();
    };
    const onErrorListener = () => {
      this.eventTarget.dispatchEvent(new CustomEvent("error"));
      this.eventTarget.dispatchEvent(new CustomEvent("disconnected"));

      clearInterval(this.heartbeatTimeId);

      if (this.isCanReconnect) {
        this.reconnect();
      }
    };
    const onCloseListener = () => {
      this.eventTarget.dispatchEvent(new CustomEvent("error"));
      this.eventTarget.dispatchEvent(new CustomEvent("disconnected"));

      clearInterval(this.heartbeatTimeId);

      if (this.isCanReconnect) {
        this.reconnect();
      }
    };
    const onMessageListener = (event: MessageEvent) => {
      const detail: MessageFromServer = JSON.parse(event.data);
      const customEvent = new CustomEvent("message", {
        detail,
      });

      this.logger.debug(detail.message, "message");

      if (detail.message.type === "identity") {
        this.id = detail.message.id;
        this.logger.debug(detail.message.id, "connected");
      }

      this.eventTarget.dispatchEvent(customEvent);
    };

    socket.addEventListener("open", onOpenListener);
    socket.addEventListener("error", onErrorListener);
    socket.addEventListener("close", onCloseListener);
    socket.addEventListener("message", onMessageListener);

    return () => {
      socket.removeEventListener("open", onOpenListener);
      socket.removeEventListener("error", onErrorListener);
      socket.removeEventListener("close", onCloseListener);
      socket.removeEventListener("message", onMessageListener);
    };
  }

  //#region connect

  connect() {
    const protocol = `ws${location.protocol === "https:" ? "s" : ""}://`;
    const hostname = location.hostname;
    const port = location.port;
    const params = new URLSearchParams(location.search);

    if (this.id) {
      params.set("session_id", this.id);
    }

    const url = import.meta.env.DEV
      ? `ws://localhost:8787/${this.roomName}/websocket`
      : new URL(
          `${protocol}${hostname}${port ? `:${port}` : ""}/api/room/${
            this.roomName
          }/websocket?${params}`,
        );

    this.socket = new WebSocket(url);

    this.unRegisterListener = this.registerListener(this.socket);
    this.heartbeat();
  }

  private reconnect() {
    if (isUndefined(this.reconnectTimeId) === false) return;

    this.reconnectTimeId = setTimeout(() => {
      this.reconnectTimeId = undefined;

      this.connect();
    }, 1000);
  }

  //#region events

  leave() {
    this.send({ type: "leave" });
  }

  private heartbeat() {
    this.heartbeatTimeId = setInterval(
      () => this.send({ type: "heartbeat" }),
      5000,
    );
  }

  //#region listener

  addEventListener<Type extends keyof SignalEvents>(
    type: Type,
    listener: EventListener<Type>,
    options?: AddEventListenerOptions | boolean,
  ) {
    this.eventTarget.addEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }

  removeEventListener<Type extends keyof SignalEvents>(
    type: Type,
    listener: EventListener<Type>,
    options?: AddEventListenerOptions | boolean,
  ) {
    this.eventTarget.removeEventListener(
      type,
      listener as EventListenerOrEventListenerObject,
      options,
    );
  }
}
