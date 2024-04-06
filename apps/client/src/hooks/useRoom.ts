import { useParams, useSearch } from "@tanstack/react-router";
import { RoomRoute } from "../router";
import useDisplayMedia from "./useDisplayMedia";
import { useWebSocket, type WebSocket } from "./useWebSocket";

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
  extends CreateSessionOptions,
    CreateSessionListeners {
  stream: MediaStream;
}

type CreateClientSessionOptions = CreateSessionOptions &
  CreateSessionListeners &
  CreateClientSessionListeners;

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

const createHostSession = async ({
  sid,
  socket,
  stream,
  onDone,
}: CreateHostSessionOptions) => {
  const connection = new RTCPeerConnection();

  onIceCandidateListener(connection, socket, sid, "host");
  // onNegotiationneededListener(connection, socket, sid);
  onConnectionStateChangeListener(connection, onDone);
  onIceConnectionStateChange(connection);

  stream.getTracks().forEach((track) => connection.addTrack(track));

  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);

  socket.emit("offer", { sid, offer });

  return connection;
};

const createClientSession = ({
  sid,
  socket,

  onDone,
  onTrack,
}: CreateClientSessionOptions) => {
  const connection = new RTCPeerConnection();

  onIceCandidateListener(connection, socket, sid, "client");
  // onNegotiationneededListener(connection, socket, sid);
  onConnectionStateChangeListener(connection, onDone);
  onIceConnectionStateChange(connection);

  connection.addEventListener("track", (evt) => {
    const stream = new MediaStream();

    console.log("track", evt);

    stream.addTrack(evt.track);
    onTrack(stream);
  });

  return connection;
};

export default function useRoom() {
  const { id: roomId } = useParams({ from: RoomRoute.id });
  const { autoClose } = useSearch({ from: RoomRoute.id });

  const { connection: socket } = useWebSocket();
  const {
    enabled: isUsingScreenStream,
    stream: screenStream,
    start: onGetScreenStream,
    stop: onStopScreenStream,
    isSupported: isSupportShareScreen,
  } = useDisplayMedia();

  const hostConnectionPool = useRef<Map<string, RTCPeerConnection>>(new Map());
  const clientConnectionPool = useRef<Map<string, RTCPeerConnection>>(
    new Map()
  );

  const [selectedStream, setSelectedStream] = useState<MediaStream>();
  const [clientStreams, setClientStreams] = useState<
    { stream: MediaStream; sid: string }[]
  >([]);
  const [hostStream, setHostStream] = useState<MediaStream>();

  //#region Screen Control

  const onShareScreen = async () => {
    await onGetScreenStream();

    setHostStream(screenStream.current);

    socket.emit("share");
  };

  const onStopShareScreen = () => {
    onStopScreenStream();

    hostConnectionPool.current.forEach((host) => host.close());
    hostConnectionPool.current.clear();

    setHostStream(undefined);

    socket.emit("stopShare");
  };

  //#region Socket Listener
  useEffect(() => {
    socket
      .on("addIceCandidate", async (evt) => {
        const {
          data: { type: target, candidate, sid },
        } = evt;
        const container =
          target === "client" ? hostConnectionPool : clientConnectionPool;

        const connection = container.current.get(sid);

        await connection?.addIceCandidate(candidate);
      })
      .on("offer", async ({ data: { sid, offer } }) => {
        const connection = clientConnectionPool.current.get(sid);
        await connection?.setRemoteDescription(offer);

        const answer = await connection?.createAnswer();
        await connection?.setLocalDescription(answer);
        socket.emit("answer", { sid, answer: answer! });
      })
      .on("answer", async (evt) => {
        const {
          data: { sid, answer },
        } = evt;

        const connection = hostConnectionPool.current.get(sid);
        await connection?.setRemoteDescription(answer);
      })
      .on("createHostSession", async ({ data: { sid } }) => {
        const connection = await createHostSession({
          socket,
          sid,
          stream: screenStream.current!,
          onDone: () => {
            hostConnectionPool.current.delete(sid);
          },
        });

        hostConnectionPool.current.set(sid, connection);
      })
      .on("createClientSession", async ({ data: { sid } }) => {
        const connection = createClientSession({
          sid,
          socket,
          onDone: () => {
            clientConnectionPool.current.delete(sid);
            setClientStreams((prev) => prev.filter((data) => data.sid !== sid));
          },
          onTrack: (stream) => {
            setClientStreams((prev) => [...prev, { sid, stream }]);
          },
        });

        clientConnectionPool.current.set(sid, connection);
      })
      .on("stopShare", (evt) => {
        const {
          data: { sid },
        } = evt;

        hostConnectionPool.current.get(sid)?.close();
        clientConnectionPool.current.get(sid)?.close();

        hostConnectionPool.current.delete(sid);
        clientConnectionPool.current.delete(sid);

        setClientStreams((prev) => prev.filter((data) => data.sid !== sid));
      });

    return () => {
      socket
        .off("addIceCandidate")
        .off("offer")
        .off("answer")
        .off("createHostSession")
        .off("createClientSession")
        .off("stopShare");
    };
  }, [screenStream, socket]);

  useEffect(() => {
    socket.emit("join", { roomId, autoClose: !!autoClose });
  }, [autoClose, roomId, socket]);

  return {
    clientStreams,
    hostStream,

    selectedStream,
    onSetCurrentSelectedStream: setSelectedStream,

    isUsingScreenStream,
    isSupportShareScreen,
    onShareScreen,
    onStopShareScreen,
  };
}
