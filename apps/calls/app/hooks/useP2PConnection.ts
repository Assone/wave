import P2PConnection from "@/models/P2PConnection";
import { useEffect, useState } from "react";

export default function useP2PConnection() {
  const [connection, setConnection] = useState<P2PConnection>();
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>("new");

  useEffect(() => {
    const peer = new P2PConnection();
    setConnection(peer);

    const iceConnectionStateChangeListener = () => {
      setIceConnectionState(peer.connection.iceConnectionState);
    };

    peer.connection.addEventListener(
      "iceconnectionstatechange",
      iceConnectionStateChangeListener
    );

    return () => {
      peer.connection.removeEventListener(
        "iceconnectionstatechange",
        iceConnectionStateChangeListener
      );
      peer.destroy();
    };
  }, []);

  return { connection, iceConnectionState };
}
