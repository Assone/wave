import useIsomorphicLayoutEffect from "@/hooks/useIsomorphicLayoutEffect";
import useOnce from "@/hooks/useOnce";
import { useState, type Dispatch, type SetStateAction } from "react";
import { isFunction } from "./is";

const createGlobalState = <S>(initialState: S) => {
  const store: {
    state: S;
    setters: Dispatch<SetStateAction<S>>[];
    setState: Dispatch<SetStateAction<S>>;
  } = {
    state: isFunction(initialState) ? initialState() : initialState,
    setters: [],
    setState: (nextState) => {
      store.state = isFunction(nextState) ? nextState(store.state) : nextState;
      store.setters.forEach((setter) => setter(store.state));
    },
  };

  return () => {
    const [state, setState] = useState(store.state);

    useOnce(() => {
      store.setters = store.setters.filter((setter) => setter !== setState);
    });

    useIsomorphicLayoutEffect(() => {
      if (store.setters.includes(setState) === false) {
        store.setters.push(setState);
      }
    });

    return [state, store.setState] as const;
  };
};

export default createGlobalState;
