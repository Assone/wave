import useSupport from "./useSupport.ts";

export default function useUserMedia() {
  const stream = useRef<MediaStream>();
  const isSupported = useSupport(() => navigator?.mediaDevices?.getUserMedia);
  const [enabled, setEnabled] = useState(false);

  const startStreamHandler = useCallback(
    async (constraints: MediaStreamConstraints) => {
      if (!isSupported || stream.current) return;

      stream.current = await navigator.mediaDevices.getUserMedia(constraints);

      return stream.current;
    },
    [isSupported]
  );

  const stopStreamHandler = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = undefined;
  };

  const start = useCallback(
    async (constraints: MediaStreamConstraints) => {
      await startStreamHandler(constraints);

      if (stream.current) {
        setEnabled(true);
      }

      return stream.current;
    },
    [startStreamHandler]
  );

  const stop = useCallback(() => {
    stopStreamHandler();

    setEnabled(false);
  }, []);

  const restart = useCallback(
    (constraints: MediaStreamConstraints) => {
      stopStreamHandler();

      return start(constraints);
    },
    [start]
  );

  return {
    stream,

    isSupported,
    enabled,

    start,
    stop,
    restart,
  };
}
