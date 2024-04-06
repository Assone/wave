import usePermission from "./usePermission.ts";
import useSupport from "./useSupport.ts";

interface UseDevicesOptions {
  request?: boolean;
  constraints?: MediaStreamConstraints;
}

export default function useDevices({
  request,
  constraints = { video: true, audio: true },
}: UseDevicesOptions = {}) {
  const isSupported = useSupport(
    () => navigator?.mediaDevices?.enumerateDevices
  );
  const stream = useRef<MediaStream>();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { state, query } = usePermission({ name: "camera" });

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const audioOutput = useMemo(
    () => devices.filter((device) => device.kind === "audiooutput"),
    [devices]
  );
  const videoInput = useMemo(
    () => devices.filter((device) => device.kind === "videoinput"),
    [devices]
  );
  const audioInput = useMemo(
    () => devices.filter((device) => device.kind === "audioinput"),
    [devices]
  );

  const update = async () => {
    const list = await navigator.mediaDevices.enumerateDevices();

    setDevices(list);

    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
      stream.current = undefined;
    }
  };

  const ensurePermissions = useCallback(async () => {
    if (!isSupported) return false;
    if (permissionGranted) return true;

    await query();

    if (state !== "granted") {
      stream.current = await navigator.mediaDevices.getUserMedia(constraints);
      update();
      setPermissionGranted(true);
    } else {
      setPermissionGranted(true);
    }

    return permissionGranted;
  }, [constraints, isSupported, permissionGranted, query, state]);

  useEffect(() => {
    if (isSupported) {
      if (request) {
        ensurePermissions();
      }

      navigator.mediaDevices.addEventListener("devicechange", update);
      void update();

      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", update);
      };
    }
  }, [isSupported, request]);

  return {
    isSupported,

    devices,
    audioOutput,
    videoInput,
    audioInput,

    permissionGranted,
    ensurePermissions,
  };
}
