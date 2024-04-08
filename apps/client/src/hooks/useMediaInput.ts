import useDevices from "./useDevices";
import useUserMedia from "./useUserMedia";
import useWatch from "./useWatch";

export default function useMediaInput() {
  const [cameraStatus, setCameraStatus] = useState(false);
  const [micStatus, setMicStatus] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>();
  const [selectedAudio, setSelectedAudio] = useState<string>();
  const { videoInput, audioInput, permissionGranted, ensurePermissions } =
    useDevices({
      constraints: { audio: true, video: true },
    });
  const { stream, restart, stop } = useUserMedia();

  const onStartOrStop = async (camera: boolean, audio: boolean) => {
    if (camera === false && audio === false) {
      stop();
    } else {
      if (permissionGranted === false) ensurePermissions();

      await restart({
        video: camera ? { deviceId: selectedCamera } : false,
        audio: audio ? { deviceId: selectedAudio } : false,
      });
    }
  };

  const onOpenCamera = async () => {
    setCameraStatus(true);
    await onStartOrStop(true, micStatus);
  };

  const onOffCamera = async () => {
    setCameraStatus(false);
    await onStartOrStop(false, micStatus);
  };

  const onOpenMic = async () => {
    setMicStatus(true);
    await onStartOrStop(cameraStatus, true);
  };

  const onOffMic = async () => {
    setMicStatus(false);
    await onStartOrStop(cameraStatus, false);
  };

  useWatch(videoInput, ([{ deviceId } = { deviceId: undefined }]) => {
    setSelectedCamera(deviceId);
  });

  useWatch(audioInput, ([{ deviceId } = { deviceId: undefined }]) => {
    setSelectedAudio(deviceId);
  });

  return {
    cameraStatus,
    micStatus,
    videoInput,
    audioInput,

    selectedCamera,
    selectedAudio,
    setSelectedCamera,
    setSelectedAudio,

    stream,

    onOpenCamera,
    onOffCamera,
    onOpenMic,
    onOffMic,
  };
}
