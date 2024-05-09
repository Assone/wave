import type P2PConnection from "@/models/P2PConnection";
import type { ResourceID } from "@/models/P2PConnection";
import { noop } from "@/utils/helper";
import { useEffect, useState } from "react";

export default function usePushedTrack(
  connection?: P2PConnection,
  track?: MediaStreamTrack
) {
  const [transceiverId, setTransceiverId] = useState<ResourceID>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (pending || !connection || !track) return noop;

    if (transceiverId === undefined) {
      setPending(true);

      connection.push(track.id, track).then(({ sessionId, trackId }) => {
        const resourceId: ResourceID = `${sessionId}/${trackId}`;

        setTransceiverId(resourceId);
        setPending(false);
      });
    } else {
      connection.replace(transceiverId, track);
    }
  }, [connection, pending, track, transceiverId]);

  return transceiverId;
}
