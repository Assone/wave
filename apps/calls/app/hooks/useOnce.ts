import { useEffect, type EffectCallback } from "react";
import useLatest from "./useLatest";

export default function useOnce(callback: EffectCallback) {
  const fn = useLatest(callback);

  useEffect(() => fn.current(), []);
}
