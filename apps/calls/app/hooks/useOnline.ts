import { useDebugValue, useSyncExternalStore } from "react";

const subscribe = (callback: VoidFunction) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getSnapshot = () => navigator.onLine;

const getServerSnapshot = () => true;

export default function useOnline() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useDebugValue(isOnline, (value) => `Is ${value ? "online" : "offline"}`);

  return isOnline;
}
