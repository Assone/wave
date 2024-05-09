import type { ResourceID } from "@/models/P2PConnection";
import { isUndefined } from "@/utils/is";
import { useEffect, useState } from "react";
import useRoomProvider from "./useRoomProvider";

export default function usePulledTrack(resourceId?: ResourceID) {
  const { connection } = useRoomProvider();
  const [streamTrack, setStreamTrack] = useState<MediaStreamTrack>();

  useEffect(() => {
    if (!connection || isUndefined(resourceId)) return;

    const [sessionId, trackId] = resourceId.split("/");

    connection
      .pull({
        location: "remote",
        sessionId,
        trackName: trackId,
      })
      .then((track) => {
        setStreamTrack(track);
      });
  }, [connection, resourceId]);

  return streamTrack;
}
