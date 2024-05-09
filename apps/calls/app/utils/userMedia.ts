import invariant from "tiny-invariant";
import { isObject } from "./is";

interface MediaTrackConstraintsExtends extends MediaTrackConstraints {
  label?: string;
}

interface MediaStreamConstraintsWithLabels extends MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraintsExtends;
  video?: boolean | MediaTrackConstraintsExtends;
}

const findDevice = (
  devices: MediaDeviceInfo[],
  type: MediaDeviceKind,
  deviceId: ConstrainDOMString | undefined,
  label: string | undefined
) =>
  devices.find((device) => device.deviceId === deviceId) ??
  devices.find((device) => device.kind === type && device.label === label);

const getMediaConfigByConstraints = (
  devices: MediaDeviceInfo[],
  type: MediaDeviceKind,
  trackConstraints?: MediaTrackConstraintsExtends | boolean
): MediaTrackConstraintsExtends | boolean | undefined => {
  if (isObject(trackConstraints)) {
    const { deviceId, label, ...config } = trackConstraints;

    const device = findDevice(devices, "audioinput", deviceId, label);

    return {
      ...config,
      deviceId: device?.deviceId,
    };
  } else {
    return trackConstraints;
  }
};

export const getUserMedia = async (
  constraints?: MediaStreamConstraintsWithLabels
) => {
  const devices = await navigator.mediaDevices.enumerateDevices();

  if (
    devices.filter((device) => device.deviceId !== "" && device.label !== "")
      .length === 0
  ) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach((track) => track.stop());
  }

  if (!constraints) return navigator.mediaDevices.getUserMedia();

  const { audio, video, peerIdentity, preferCurrentTab } = constraints;
  const config: MediaStreamConstraints = {
    peerIdentity,
    preferCurrentTab,
    audio: getMediaConfigByConstraints(devices, "audioinput", audio),
    video: getMediaConfigByConstraints(devices, "videoinput", video),
  };

  return navigator.mediaDevices.getUserMedia(config);
};

export const blackCanvasStreamTrack = (videoTrack: MediaStreamTrack) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const settings = videoTrack.getSettings();

  canvas.width = settings.width ?? 0;
  canvas.height = settings.height ?? 0;

  invariant(context);

  context.fillStyle = "black";

  const render = () => {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const stream = canvas.captureStream();
  const [track] = stream.getVideoTracks() as [MediaStreamTrack];

  render();

  const timeId = setInterval(render, 1000);

  track.addEventListener("ended", () => {
    clearInterval(timeId);
  });

  return track;
};
