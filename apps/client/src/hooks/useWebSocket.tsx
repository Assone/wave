import { createContext, type PropsWithChildren } from "react";
import { Socket, io } from "socket.io-client";
import type {
  AddIceCandidateData,
  AnswerData,
  ClientAnswerMessage,
  CreateClientSession,
  CreateHostSession,
  HostOfferMessage,
  IceCandidateMessage,
  JoinData,
  OfferData,
  StopShareMessage,
} from "../message";

interface ListenEvents {
  connected: (id: string) => void;

  offer: (message: HostOfferMessage) => void;
  answer: (message: ClientAnswerMessage) => void;
  addIceCandidate: (message: IceCandidateMessage) => void;

  createHostSession: (message: CreateHostSession) => void;
  createClientSession: (message: CreateClientSession) => void;

  share: VoidFunction;
  stopShare: (message: StopShareMessage) => void;
}

interface EmitEvents {
  addIceCandidate: (data: AddIceCandidateData) => void;
  offer: (data: OfferData) => void;
  answer: (data: AnswerData) => void;

  join: (data: JoinData) => void;

  share: VoidFunction;
  stopShare: VoidFunction;
}

export type WebSocket = Socket<ListenEvents, EmitEvents>;

interface WebSocketContextType {
  connection: WebSocket;
  id?: string;
}

const WebSocketContext = createContext<WebSocketContextType>(null!);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const connection = useRef<Socket<ListenEvents, EmitEvents>>(io());
  const id = useRef<string>();

  const value = useMemo<WebSocketContextType>(
    () => ({ connection: connection.current, id: id.current }),
    []
  );

  useEffect(() => {
    connection.current.on("connected", (sid) => {
      id.current = sid;
    });

    return () => {
      connection.current.off("connect");
    };
  }, []);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
