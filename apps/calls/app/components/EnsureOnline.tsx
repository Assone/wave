import useOnline from "@/hooks/useOnline";
import type { PropsWithChildren } from "react";

interface EnsureOnlineProps {
  fallback: React.ReactNode;
}

const EnsureOnline: React.FC<PropsWithChildren<EnsureOnlineProps>> = ({
  fallback,
  children,
}) => {
  const isOnline = useOnline();

  if (isOnline) {
    return children;
  }

  return fallback;
};

export default EnsureOnline;
