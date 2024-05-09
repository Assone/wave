import { useEffect } from "react";

export default function useMounted(callback: VoidFunction) {
  useEffect(callback, []);
}
