import { cn } from "@/lib/utils";
import { noop } from "@/utils/helper";
import { isUndefined } from "@/utils/is";
import { useEffect, useRef } from "react";

interface StreamMonitorProps
  extends Omit<
    React.DetailedHTMLProps<
      React.VideoHTMLAttributes<HTMLVideoElement>,
      HTMLVideoElement
    >,
    "ref"
  > {
  track?: MediaStreamTrack;
}

const StreamMonitor: React.FC<StreamMonitorProps> = ({
  track,
  className,
  ...props
}) => {
  const instance = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isUndefined(track)) return noop;

    const stream = new MediaStream();
    stream.addTrack(track);

    const element = instance.current;

    if (element) {
      element.setAttribute("autoplay", "true");
      element.setAttribute("playsinline", "true");

      element.srcObject = stream;
    }

    return () => {
      stream.removeTrack(track);

      if (element) {
        element.srcObject = null;
      }
    };
  }, [track]);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video className={cn(className)} ref={instance} {...props} />;
};

export default StreamMonitor;
