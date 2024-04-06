import useSupport from "./useSupport";

export default function useDisplayMedia(options?: DisplayMediaStreamOptions) {
  const [enabled, setEnabled] = useState(false);
  const stream = useRef<MediaStream>();
  const isSupported = useSupport(
    () => navigator?.mediaDevices?.getDisplayMedia
  );

  const start = async () => {
    if (!isSupported || stream.current) return;

    stream.current = await navigator.mediaDevices.getDisplayMedia(options);
    setEnabled(true);

    return stream.current;
  };

  const stop = () => {
    const tracks = stream.current?.getTracks() || [];

    tracks.forEach((track) => track.stop());
    stream.current = undefined;

    setEnabled(false);
  };

  return {
    stream,
    enabled,

    isSupported,

    start,
    stop,
  };
}
