import { useEffect } from "react";
import useLatest from "./useLatest";

export default function useUnmount(callback: VoidFunction) {
  const fn = useLatest(callback);

  useEffect(() => () => fn.current(), []);
}
