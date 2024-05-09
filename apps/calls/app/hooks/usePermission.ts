import { useCallback, useEffect, useState } from "react";
import useSupport from "./useSupport";

type DescriptorNamePolyfill =
  | "accelerometer"
  | "accessibility-events"
  | "ambient-light-sensor"
  | "background-sync"
  | "camera"
  | "clipboard-read"
  | "clipboard-write"
  | "geolocation"
  | "gyroscope"
  | "local-fonts"
  | "magnetometer"
  | "microphone"
  | "midi"
  | "notifications"
  | "payment-handler"
  | "persistent-storage"
  | "push"
  | "screen-wake-lock"
  | "storage-access"
  | "top-level-storage-access"
  | "window-management";

type GeneralPermissionDescriptor =
  | PermissionDescriptor
  | { name: DescriptorNamePolyfill };

export default function usePermission(desc: GeneralPermissionDescriptor) {
  const isSupported = useSupport(() => navigator?.permissions?.query);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>();
  const [state, setState] = useState<PermissionState>();

  const onChange = useCallback(() => {
    if (permissionStatus) {
      setState(permissionStatus.state);
    }
  }, [permissionStatus]);

  const query = useCallback(async () => {
    if (!isSupported) return;
    try {
      const status = await navigator.permissions.query(
        desc as PermissionDescriptor,
      );

      setPermissionStatus(status);
    } catch (error) {
      console.log(error);

      setState("prompt");
    }

    return permissionStatus;
  }, [desc, isSupported, permissionStatus]);

  useEffect(() => {
    if (!isSupported) return;

    permissionStatus?.addEventListener("change", onChange);

    return () => {
      permissionStatus?.removeEventListener("change", onChange);
    };
  }, [isSupported, onChange, permissionStatus]);

  useEffect(() => {
    onChange();
  }, [onChange, permissionStatus]);

  return {
    isSupported,
    query,
    state,
  };
}
