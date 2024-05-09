import { watchAudioVolume } from "@/utils/audio";
import { noop } from "@/utils/helper";
import { isUndefined } from "@/utils/is";
import { useEffect, useState } from "react";

export default function useAudioLevel(track?: MediaStreamTrack) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (isUndefined(track)) return noop;

    const { start, stop } = watchAudioVolume({
      track,
      onChange: (volume) => {
        setLevel(Math.round(volume * 100) / 100);
      },
    });

    start();

    return () => {
      stop();
    };
  }, [track]);

  return Math.min(1, level * 3);
}
