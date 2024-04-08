import { useParams, useSearch } from "@tanstack/react-router";
import type { MutableRefObject } from "react";
import SessionManager from "../models/SessionManager";
import { RoomRoute } from "../router";
import { useWebSocket } from "./useWebSocket";

export default function useRoom(
  stream: MutableRefObject<MediaStream | undefined>
) {
  const { id: roomId } = useParams({ from: RoomRoute.id });
  const { autoClose } = useSearch({ from: RoomRoute.id });

  const { connection: socket } = useWebSocket();

  const sessionManager = useRef(new SessionManager());
  const [selectedStream, setSelectedStream] = useState<MediaStream>();
  const [clientStreams, setClientStreams] = useState<
    { stream: MediaStream; sid: string }[]
  >([]);
  const [hostStream, setHostStream] = useState<MediaStream>();
  const [isSharing, setIsSharing] = useState(false);

  //#region Share Control

  const onShare = async () => {
    setHostStream(stream.current);

    if (isSharing) {
      sessionManager.current.replaceTrack(stream.current!);
    } else {
      socket.emit("share");
      setIsSharing(true);
    }
  };

  const onStopShare = () => {
    sessionManager.current.host.clean();

    setHostStream(undefined);
    setIsSharing(false);

    socket.emit("stopShare");
  };

  //#region Socket Listener
  useEffect(() => {
    socket
      .on("addIceCandidate", async ({ data: { type, candidate, sid } }) => {
        const connection = sessionManager.current.find(
          type === "client" ? "host" : "client",
          sid
        );

        await connection?.addIceCandidate(candidate);
      })
      .on("offer", async ({ data: { sid, offer } }) => {
        const connection = sessionManager.current.find("client", sid);
        await connection?.setRemoteDescription(offer);

        const answer = await connection?.createAnswer();
        await connection?.setLocalDescription(answer);
        socket.emit("answer", { sid, answer: answer! });
      })
      .on("answer", async ({ data: { sid, answer } }) => {
        const connection = sessionManager.current.find("host", sid);
        await connection?.setRemoteDescription(answer);
      })
      .on("createHostSession", async ({ data: { sid } }) => {
        sessionManager.current.createHost({
          socket,
          sid,
          stream: stream.current!,
          onDone: () => {
            sessionManager.current.host.delete(sid);
          },
        });
      })
      .on("createClientSession", async ({ data: { sid } }) => {
        sessionManager.current.createClient({
          sid,
          socket,
          onDone: () => {
            sessionManager.current.client.delete(sid);
            setClientStreams((prev) => prev.filter((data) => data.sid !== sid));
          },
          onTrack: (stream) => {
            console.log("track");
            setClientStreams((prev) => [...prev, { sid, stream }]);
          },
        });
      })
      .on("stopShare", ({ data: { sid } }) => {
        sessionManager.current.delete(sid);

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
  }, [socket, stream]);

  useEffect(() => {
    socket.emit("join", { roomId, autoClose: !!autoClose });
  }, [autoClose, roomId, socket]);

  return {
    clientStreams,
    hostStream,

    selectedStream,
    onSetCurrentSelectedStream: setSelectedStream,

    isSharing,
    onShare,
    onStopShare,
  };
}
