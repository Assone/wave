import { useDebugValue, useMemo } from "react";

export default function useSupport(callback: () => unknown) {
  const result = useMemo(() => Boolean(callback()), [callback]);

  useDebugValue(result ? "Supported" : "Not supported");

  return result;
}
