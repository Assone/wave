import usePermission from "@/hooks/usePermission";
import { useEffect, type PropsWithChildren } from "react";
import { Button } from "./ui/button";

const EnsurePermissions: React.FC<PropsWithChildren> = ({ children }) => {
  const { state, query } = usePermission({ name: "microphone" });

  const onAllowPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => track.stop());
    } finally {
      await query();
    }
  };

  useEffect(() => {
    query();
  }, []);

  switch (state) {
    case "denied":
      return (
        <div className="flex justify-center items-center h-full flex-col">
          <div className="space-y-2 max-w-80">
            <h1 className="text-2xl font-bold">Permission denied</h1>
            <p>
              You will need to go into your browser settings and manually
              re-enable permission.
            </p>
          </div>
        </div>
      );

    case "prompt":
      return (
        <div className="flex justify-center items-center h-full">
          <div className="space-y-2 max-w-80">
            <p className="mb-8">
              In order to use Wave Meets, you will need to grant permission to
              your camera and microphone. You will be prompted for access.
            </p>
            <Button onClick={onAllowPermissions}>Allow</Button>
          </div>
        </div>
      );

    case "granted":
      return children;

    default:
      return null;
  }
};

export default EnsurePermissions;
