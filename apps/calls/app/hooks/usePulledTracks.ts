import type { ResourceID } from "@/models/P2PConnection";
import { useEffect, useState } from "react";
import useRoomProvider from "./useRoomProvider";

export default function usePulledTracks(tracks: ResourceID[]) {
  const { connection } = useRoomProvider();
  const [tracksMap, setTracksMap] = useState<
    Record<ResourceID, MediaStreamTrack>
  >({});

  useEffect(() => {
    if (!connection) return;

    tracks.forEach((resourceId) => {
      const isAlreadyPulled = tracksMap[resourceId];

      if (isAlreadyPulled) return;
      const [sessionId, trackId] = resourceId.split("/");

      connection
        .pull({
          location: "remote",
          sessionId,
          trackName: trackId,
        })
        .then((track) => {
          setTracksMap((prev) => ({
            ...prev,
            [resourceId]: track,
          }));
        });
    });
  }, [connection, tracks, tracksMap]);

  return tracksMap;
}
