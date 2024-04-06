import usePrevious from "./usePrevious.ts";
import useSupport from "./useSupport.ts";

interface UseUserMediaOptions {
  constraints?: MediaStreamConstraints;
}

export default function useUserMedia(options?: UseUserMediaOptions) {
  const stream = useRef<MediaStream>();
  const isSupported = useSupport(() => navigator?.mediaDevices?.getUserMedia);
  const [enabled, setEnabled] = useState(false);
  const previousOptions = usePrevious(options);

  const start = useCallback(async () => {
    if (!isSupported || stream.current) return;

    stream.current = await navigator.mediaDevices.getUserMedia(
      options?.constraints
    );

    setEnabled(true);

    return stream.current;
  }, [isSupported, options?.constraints]);

  const stop = () => {
    const tracks = stream.current?.getTracks() || [];

    tracks.forEach((track) => track.stop());
    stream.current = undefined;

    setEnabled(false);
  };

  const restart = useCallback(() => {
    stop();

    return start();
  }, [start]);

  useEffect(() => {
    if (enabled && options?.constraints !== previousOptions?.constraints)
      void restart();
  }, [enabled, options?.constraints, previousOptions?.constraints, restart]);

  return {
    stream,

    isSupported,
    enabled,

    start,
    stop,
  };
}
