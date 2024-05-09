import { isError, isKeyInRecord } from "@/utils/is";
import { blackCanvasStreamTrack, getUserMedia } from "@/utils/userMedia";
import { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import useDevices, {
  useAudioInputDeviceId,
  useAudioInputLabel,
  useVideoInputDeviceId,
  useVideoInputLabel,
} from "./useDevices";
import useSupport from "./useSupport";
import useUnmount from "./useUnmount";

export const errorMessageMap = {
  NotAllowedError:
    "Permission was denied. Grant permission and reload to enable.",
  NotFoundError: "No device was found.",
  NotReadableError: "Device is already in use.",
  OverconstrainedError: "No device was found that meets constraints",
};

type UserMediaError = keyof typeof errorMessageMap;

export default function useUserMedia() {
  const isSupportScreenShare = useSupport(
    () => navigator?.mediaDevices?.getDisplayMedia,
  );
  const [devices] = useDevices();

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenShareEnabled, setShareScreenEnabled] = useState(false);

  const [audioStreamTrack, setAudioStreamTrack] = useState<MediaStreamTrack>();
  const [muteAudioStreamTrack, setMuteAudioStreamTrack] =
    useState<MediaStreamTrack>();
  const [videoStreamTrack, setVideoStreamTrack] = useState<MediaStreamTrack>();
  const [screenStream, setScreenStream] = useState<MediaStream>();

  const [audioUnavailableReason, setAudioUnavailableReason] =
    useState<UserMediaError>();
  const [videoUnavailableReason, setVideoUnavailableReason] =
    useState<UserMediaError>();
  const [screenShareUnavailableReason, setScreenShareUnavailableReason] =
    useState<UserMediaError>();

  const screenShareStreamTrack = useMemo(
    () => screenStream?.getTracks()[0],
    [screenStream],
  );

  const [videoInputDeviceId, setVideoInputDeviceId] = useVideoInputDeviceId();
  const [videoInputLabel, setVideoInputLabel] = useVideoInputLabel();
  const [audioInputDeviceId, setAudioInputDeviceId] = useAudioInputDeviceId();
  const [audioInputLabel, setAudioInputLabel] = useAudioInputLabel();

  const turnCameraOn = () => {
    setVideoEnabled(true);
  };

  const turnCameraOff = () => {
    setVideoEnabled(false);
  };

  const turnMicOn = () => {
    setAudioEnabled(true);
  };

  const turnMicOff = () => {
    setAudioEnabled(false);
  };

  const startScreenShare = async () => {
    if (!isSupportScreenShare) return;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia();
      const [video] = stream.getVideoTracks();

      setScreenStream(stream);
      setShareScreenEnabled(true);

      video?.addEventListener("ended", stopScreenShare);
    } catch (error) {
      setShareScreenEnabled(false);
      invariant(isKeyInRecord(errorMessageMap, (error as Error).name));
      setScreenShareUnavailableReason((error as Error).name as UserMediaError);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }

    setShareScreenEnabled(false);
    setScreenStream(undefined);
  };

  useEffect(() => {
    let mounted = true;

    getUserMedia({
      audio: audioInputDeviceId
        ? { deviceId: audioInputDeviceId, label: audioInputLabel }
        : true,
    })
      .then((stream) => {
        if (mounted === false) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const [audio] = stream.getAudioTracks() as [MediaStreamTrack];
        const { deviceId } = audio.getSettings();
        const { label } =
          devices.find((device) => device.deviceId === deviceId) ?? {};

        audio.addEventListener("ended", () => {
          setAudioInputDeviceId(undefined);
        });

        setAudioInputDeviceId(deviceId);
        setAudioInputLabel(label);
        setAudioStreamTrack((prev) => {
          prev?.stop();

          return audio;
        });
        setAudioUnavailableReason(undefined);
      })
      .catch((error: Error) => {
        setAudioEnabled(false);

        if (isError(error)) {
          invariant(isKeyInRecord(errorMessageMap, error.name));

          setAudioUnavailableReason(error.name);
        }
      });

    getUserMedia({
      audio: audioInputDeviceId ? { deviceId: audioInputDeviceId } : true,
    }).then((stream) => {
      if (mounted === false) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const [mutedAudioTrack] = stream.getAudioTracks() as [MediaStreamTrack];
      mutedAudioTrack.enabled = false;
      setMuteAudioStreamTrack(mutedAudioTrack);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (videoEnabled) {
      getUserMedia({
        video: videoInputDeviceId
          ? { deviceId: videoInputDeviceId, label: videoInputLabel }
          : true,
      })
        .then((stream) => {
          if (mounted === false) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          const [track] = stream.getTracks() as [MediaStreamTrack];
          const { deviceId } = track.getSettings();
          const { label } =
            devices.find((device) => device.deviceId === deviceId) ?? {};

          // background blur

          setVideoInputDeviceId(deviceId);
          setVideoInputLabel(label);
          setVideoStreamTrack((prev) => {
            prev?.stop();
            prev?.dispatchEvent(new Event("ended"));

            return track;
          });
          setVideoUnavailableReason(undefined);
        })
        .catch((error: Error) => {
          setVideoEnabled(false);

          invariant(isKeyInRecord(errorMessageMap, error.name));

          setVideoUnavailableReason(error.name);
        });
    } else {
      setVideoStreamTrack((prev) => {
        if (prev) {
          const track = blackCanvasStreamTrack(prev);

          prev.stop();
          prev?.dispatchEvent(new Event("ended"));

          return track;
        } else {
          return undefined;
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, []);

  useUnmount(() => {
    audioStreamTrack?.stop();
    muteAudioStreamTrack?.stop();
    videoStreamTrack?.stop();
    screenStream?.getTracks().forEach((track) => track.stop());
  });

  return {
    isSupportScreenShare,

    audioEnabled,
    videoEnabled,
    screenShareEnabled,

    audioStreamTrack: audioEnabled ? audioStreamTrack : muteAudioStreamTrack,
    videoStreamTrack,
    screenStream,

    screenShareStreamTrack,

    audioUnavailableReason,
    videoUnavailableReason,
    screenShareUnavailableReason,

    videoInputDeviceId,
    videoInputLabel,
    audioInputDeviceId,
    audioInputLabel,

    turnCameraOn,
    turnCameraOff,
    turnMicOn,
    turnMicOff,
    startScreenShare,
    stopScreenShare,
  };
}
