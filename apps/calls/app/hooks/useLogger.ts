import Logger from "@/models/Logger";
import { useRef } from "react";

export default function useLogger(name: string) {
  const logger = useRef(new Logger(name));

  return logger.current;
}
