import useAudioLevel from "@/hooks/useAudioLevel";
import { useMemo } from "react";

declare module "react" {
  interface CSSProperties {
    "--scale"?: number;
  }
}

interface AudioLevelIndicatorProps {
  track?: MediaStreamTrack;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ track }) => {
  const level = useAudioLevel(track);
  const MIN = 0.6;
  const MODIFIER = 0.8;

  const scale = useMemo(() => Math.max(MIN, level + MODIFIER), [level]);

  return (
    <div className="relative">
      <div
        className="h-4 w-4 rounded-full scale-[--scale] transition duration-75 bg-orange-500"
        style={{ "--scale": scale }}
      />
      <div
        className="h-2 w-2 rounded-full scale-[--scale] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition duration-75 bg-orange-100"
        style={{ "--scale": scale }}
      />
    </div>
  );
};

export default AudioLevelIndicator;
