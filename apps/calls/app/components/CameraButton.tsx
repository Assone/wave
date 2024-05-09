import useRoomProvider from "@/hooks/useRoomProvider";
import { isString } from "@/utils/is";
import { Video, VideoOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const CameraButton: React.FC = () => {
  const { userMedia } = useRoomProvider();
  const { videoUnavailableReason, videoEnabled, turnCameraOn, turnCameraOff } =
    userMedia;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={videoEnabled ? "destructive" : "default"}
            disabled={isString(videoUnavailableReason)}
            onClick={videoEnabled ? turnCameraOff : turnCameraOn}
          >
            {videoEnabled ? <VideoOff /> : <Video />}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>Turn Camera {videoEnabled ? "off" : "on"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CameraButton;
