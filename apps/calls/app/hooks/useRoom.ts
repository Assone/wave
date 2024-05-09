import type { MessageFromServer } from "@/types/message";
import type { User } from "@/types/signal";
import {
  useCallback,
  useDebugValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import useLogger from "./useLogger";
import useSignal from "./useSignal";

interface RoomState {
  users: User[];
}

export default function useRoom(roomName: string) {
  const signal = useSignal(roomName);
  const logger = useLogger(useRoom.name);

  const [state, setState] = useState<RoomState>({ users: [] });
  const [userId, setUserId] = useState<string>();
  const identity = useMemo(
    () => state.users.find((user) => user.id === userId),
    [state.users, userId]
  );
  const otherUsers = useMemo(
    () => state.users.filter((user) => user.id !== userId && user.joined),
    [state.users, userId]
  );

  useDebugValue(identity, (value) => `UserID: ${value?.id}`);

  const onMessage = useCallback(
    (event: CustomEvent<MessageFromServer>) => {
      const { message } = event.detail;

      switch (message?.type) {
        case "room": {
          const newState = { users: message.users };

          if (JSON.stringify(state) !== JSON.stringify(newState)) {
            setState(newState);
          }

          break;
        }

        case "identity": {
          setUserId(message.id);

          break;
        }

        case "error": {
          logger.error(message.message, message.stack, "message - error");

          break;
        }
      }
    },
    [logger, state]
  );

  useEffect(() => {
    signal.addEventListener("message", onMessage);

    return () => {
      signal.removeEventListener("message", onMessage);
    };
  }, [onMessage, signal]);

  return {
    signal,
    identity,
    otherUsers,
  };
}
