import { useRef } from "react";
import useAsyncEffect from "./useAsyncEffect";

interface UseSoundProps {
  source: ArrayBuffer;
}

export default function useSound(options: UseSoundProps) {
  const context = useRef(new AudioContext());
  const source = useRef(context.current.createBufferSource());
  const gainNode = useRef(context.current.createGain());

  useAsyncEffect(async () => {
    const audioData = await context.current.decodeAudioData(options.source);
    source.current.buffer = audioData;
    source.current.connect(gainNode.current);
    gainNode.current.connect(context.current.destination);
    gainNode.current.gain.setValueAtTime(0.2, context.current.currentTime);

    return () => {
      source.current.disconnect();
      gainNode.current.disconnect();
    };
  });

  const play = () => {
    source.current.start();
  };

  const stop = () => {
    source.current.stop();
  };

  return {
    play,
    stop,
  };
}
