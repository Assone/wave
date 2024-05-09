import { isClient } from "@/utils/is";
import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect = isClient ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
