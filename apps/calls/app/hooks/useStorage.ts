import { isFunction, isNull, isUndefined } from "@/utils/is";
import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export type UseStorageOptions<T> = {
  storage: Storage;
  raw: boolean;
  serializer: (value: T) => string;
  deserializer: (value: string) => T;
};

export default function useStorage<T>(
  key: string,
  initialValue?: T,
  options: UseStorageOptions<T> = {
    storage: window.localStorage,
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  }
) {
  const { storage, raw } = options;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deserializer = raw ? (v: any) => v : options.deserializer;
  const serializer = options.raw ? String : options.serializer;

  const initializer = useRef((key: string) => {
    try {
      const value = storage.getItem(key);

      if (isNull(value)) {
        if (initialValue) {
          storage.setItem(key, serializer(initialValue));
        }

        return initialValue;
      } else {
        return deserializer(value);
      }
    } catch {
      return initialValue;
    }
  });
  const [state, setState] = useState<T>(initializer.current(key));

  const setter = useCallback<Dispatch<SetStateAction<T>>>(
    (nextState) => {
      try {
        const value = isFunction(nextState) ? nextState(state) : nextState;

        if (isUndefined(value)) {
          storage.removeItem(key);
        } else {
          storage.setItem(key, serializer(value));
        }

        setState(value);
      } catch (error) {
        console.error(error);
      }
    },
    [key, serializer, state, storage]
  );

  return [state, setter] as const;
}
