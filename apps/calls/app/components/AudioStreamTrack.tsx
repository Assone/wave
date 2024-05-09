import { noop } from "@/utils/helper";
import { isUndefined } from "@/utils/is";
import { useEffect, useRef } from "react";

interface AudioStreamTrackProps {
  track?: MediaStreamTrack;
}

const AudioStreamTrack: React.FC<AudioStreamTrackProps> = ({ track }) => {
  const instance = useRef<HTMLAudioElement>(null!);

  useEffect(() => {
    if (isUndefined(track)) return noop;
    const stream = new MediaStream();
    stream.addTrack(track);

    const element = instance.current;

    if (element) {
      element.srcObject = stream;
      element.setAttribute("autoplay", "true");
    }

    return () => {
      stream.removeTrack(track);

      if (element) {
        element.srcObject = null;
      }
    };
  }, [track]);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio ref={instance} />;
};

export default AudioStreamTrack;
