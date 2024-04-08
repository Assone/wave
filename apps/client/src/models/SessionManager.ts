import { type WebSocket } from "../hooks/useWebSocket";
import ConnectionPool from "./ConnectionPool";

interface CreateSessionOptions {
  sid: string;
  socket: WebSocket;
}

interface CreateSessionListeners {
  onDone: VoidFunction;
}

interface CreateClientSessionListeners {
  onTrack: (stream: MediaStream) => void;
}

interface CreateHostSessionOptions
  extends CreateSessionListeners,
    CreateSessionOptions {
  stream: MediaStream;
}

interface CreateClientSessionOptions
  extends CreateSessionListeners,
    CreateClientSessionListeners,
    CreateSessionOptions {}

const onIceCandidateListener = (
  connection: RTCPeerConnection,
  socket: WebSocket,
  sid: string,
  type: "client" | "host"
) => {
  connection.addEventListener("icecandidate", (evt) => {
    socket.emit("addIceCandidate", {
      sid,
      type,
      candidate: evt.candidate!,
    });
  });
};

const onConnectionStateChangeListener = (
  connection: RTCPeerConnection,
  onDone: VoidFunction
) => {
  connection.addEventListener("connectionstatechange", () => {
    const status: RTCPeerConnectionState[] = [
      "closed",
      "disconnected",
      "failed",
    ];

    if (status.includes(connection.connectionState)) {
      connection.close();
      onDone();
    }
  });
};

// const onNegotiationneededListener = (
//   connection: RTCPeerConnection,
//   socket: WebSocket,
//   sid: string
// ) => {
//   connection.addEventListener("negotiationneeded", async () => {
//     const offer = await connection.createOffer();

//     socket.emit("offer", { sid, offer });
//   });
// };

const onIceConnectionStateChange = (connection: RTCPeerConnection) => {
  connection.addEventListener("icecandidateerror", () => {
    if (connection.iceConnectionState === "failed") {
      connection.restartIce();
    }
  });
};

export default class SessionManager {
  host = new ConnectionPool();
  client = new ConnectionPool();

  delete(id: string) {
    this.host.delete(id);
    this.client.delete(id);
  }

  find(type: "client" | "host", id: string) {
    const pool = type === "client" ? this.client.pool : this.host.pool;

    return pool.get(id);
  }

  async createHost({ sid, socket, stream, onDone }: CreateHostSessionOptions) {
    const connection = new RTCPeerConnection();

    onIceCandidateListener(connection, socket, sid, "host");
    onConnectionStateChangeListener(connection, onDone);
    onIceConnectionStateChange(connection);

    stream.getTracks().forEach((track) => connection.addTrack(track));

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);

    socket.emit("offer", { sid, offer });

    this.host.create(sid, connection);

    return connection;
  }

  createClient({ sid, socket, onDone, onTrack }: CreateClientSessionOptions) {
    const connection = new RTCPeerConnection();

    onIceCandidateListener(connection, socket, sid, "client");
    onConnectionStateChangeListener(connection, onDone);
    onIceConnectionStateChange(connection);

    connection.addEventListener("track", (evt) => {
      const stream = new MediaStream();

      stream.addTrack(evt.track);
      onTrack(stream);
    });

    this.client.create(sid, connection);

    return connection;
  }

  replaceTrack(stream: MediaStream) {
    const senders = Array.from(this.host.pool.values()).flatMap((connection) =>
      connection.getSenders()
    );
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      senders
        .filter((sender) => sender.track?.kind === track.kind)
        .forEach((sender) => sender.replaceTrack(track));
    });
  }
}
