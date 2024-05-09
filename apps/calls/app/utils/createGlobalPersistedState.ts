import useLocalStorage from "@/hooks/useLocalStorage";
import { useEffect } from "react";
import createGlobalState from "./createGlobalState";

const createGlobalPersistedState = <T>(key: string, initialValue?: T) => {
  const useGlobalState = createGlobalState(initialValue);

  return () => {
    const [state, setState] = useGlobalState();
    const [localState, setLocalState] = useLocalStorage<T | undefined>(key);

    useEffect(() => {
      setLocalState(state);
    }, [setLocalState, state]);

    return [localState, setState] as const;
  };
};

export default createGlobalPersistedState;
