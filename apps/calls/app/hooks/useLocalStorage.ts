import type { UseStorageOptions } from "./useStorage";
import useStorage from "./useStorage";

export default function useLocalStorage<T>(
  key: string,
  initialValue?: T,
  {
    defaultWindow = window,
    ...options
  }: Omit<UseStorageOptions<T>, "storage"> & { defaultWindow?: Window } = {
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  }
) {
  return useStorage(key, initialValue, {
    ...options,
    storage: defaultWindow.localStorage,
  });
}
