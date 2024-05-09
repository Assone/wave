import { isFunction } from "@/utils/is";
import { useEffect, type DependencyList } from "react";

export default function useAsyncEffect(
  effect: () => Promise<void | VoidFunction>,
  deps?: DependencyList | undefined
) {
  useEffect(() => {
    const promise = effect();

    const execute = async () => {
      const callback = await promise;

      return callback;
    };

    let callback: void | VoidFunction;

    execute()
      .then((value) => {
        callback = value;
      })
      .catch((error) => {
        console.error("[useAsyncEffect]", error);
      });

    return () => {
      if (isFunction(callback)) {
        callback();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
