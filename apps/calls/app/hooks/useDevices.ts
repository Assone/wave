import createGlobalPersistedState from "@/utils/createGlobalPersistedState";
import createGlobalState from "@/utils/createGlobalState";
import { noop } from "@/utils/helper";
import { useCallback, useEffect, useMemo } from "react";
import useLatest from "./useLatest";
import useSupport from "./useSupport";

export const useVideoInputDeviceId = createGlobalPersistedState<string>(
  "video-input-device-id"
);

export const useVideoInputLabel =
  createGlobalPersistedState<string>("video-input-label");

export const useAudioInputDeviceId = createGlobalPersistedState<string>(
  "audio-input-device-id"
);

export const useAudioInputLabel =
  createGlobalPersistedState<string>("audio-input-label");

const useDevicesState = createGlobalState<MediaDeviceInfo[]>([]);

export default function useDevices(
  filter: (info: MediaDeviceInfo) => boolean = () => true
) {
  const isSupported = useSupport(
    () => navigator?.mediaDevices?.enumerateDevices
  );
  const [state, setState] = useDevicesState();
  const fn = useLatest(filter);
  const list = useMemo(() => state.filter(fn.current), [fn, state]);

  const onChange = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    setState(devices);
  }, [setState]);

  useEffect(() => {
    if (!isSupported) return noop;

    navigator.mediaDevices.addEventListener("devicechange", onChange);

    onChange();

    return () => {
      navigator.mediaDevices.addEventListener("devicechange", onChange);
    };
  }, [isSupported, onChange]);

  return [list, { isSupported }] as const;
}
