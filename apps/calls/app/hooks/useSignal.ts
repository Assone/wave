import Signal from "@/models/Signal";
import { useEffect, useMemo } from "react";

export default function useSignal(roomName: string) {
  const signal = useMemo(() => new Signal(roomName), [roomName]);

  useEffect(() => {
    signal.addEventListener("error", console.error);
    signal.connect();

    return () => {
      signal.destroy();
    };
  }, [roomName, signal]);

  useEffect(() => {
    return () => {
      signal.destroy();
    };
  }, [signal]);

  return signal;
}
