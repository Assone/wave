import useDevices from "./useDevices";
import useUserMedia from "./useUserMedia";

export default function useMediaInput() {
  const [cameraStatus, setCameraStatus] = useState(false);
  const [micStatus, setMicStatus] = useState(false);
  const { stream, start, stop } = useUserMedia({
    constraints: {
      video: cameraStatus,
      audio: micStatus,
    },
  });

  const { audioInput, videoInput, ensurePermissions } = useDevices({
    constraints: { video: cameraStatus, audio: micStatus },
  });

  useEffect(() => {
    if (cameraStatus || micStatus) {
      start();
      ensurePermissions();
    }

    return () => {
      stop();
    };
  }, [cameraStatus, ensurePermissions, micStatus, start, stop]);

  const onOpenCamera = () => {
    setCameraStatus(true);
  };

  const onOffCamera = () => {
    setCameraStatus(false);
  };

  const onOpenMic = () => {
    setMicStatus(true);
  };

  const onOffMic = () => {
    setMicStatus(false);
  };

  const onEnableCamera = () => {
    stream.current?.getVideoTracks().forEach((track) => (track.enabled = true));
  };

  const onDisableCamera = () => {
    stream.current
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = false));
  };

  const onEnableMic = () => {
    stream.current?.getAudioTracks().forEach((track) => (track.enabled = true));
  };

  const onDisableMic = () => {
    stream.current
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = false));
  };

  return {
    cameraStatus,
    micStatus,

    stream,

    onOpenCamera,
    onOffCamera,
    onOpenMic,
    onOffMic,

    onEnableCamera,
    onDisableCamera,
    onEnableMic,
    onDisableMic,
  };
}
