import type P2PConnection from "@/models/P2PConnection";
import type { User } from "@/types/signal";
import { useOutletContext } from "@remix-run/react";
import type { Dispatch, SetStateAction } from "react";
import type useRoom from "./useRoom";
import type useUserMedia from "./useUserMedia";

export interface RoomContext {
  connection?: P2PConnection;
  userMedia: ReturnType<typeof useUserMedia>;
  room: ReturnType<typeof useRoom>;

  joined: boolean;
  setJoined: Dispatch<SetStateAction<boolean>>;

  pushedTracks: User["tracks"];
}

const useRoomProvider = () => useOutletContext<RoomContext>();

export default useRoomProvider;
