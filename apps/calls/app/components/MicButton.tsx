import useRoomProvider from "@/hooks/useRoomProvider";
import { isString } from "@/utils/is";
import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const MicButton: React.FC = () => {
  const { userMedia } = useRoomProvider();
  const { audioUnavailableReason, audioEnabled, turnMicOn, turnMicOff } =
    userMedia;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={audioEnabled ? "destructive" : "default"}
            disabled={isString(audioUnavailableReason)}
            onClick={audioEnabled ? turnMicOff : turnMicOn}
          >
            {audioEnabled ? <MicOff /> : <Mic />}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>Turn Camera {audioEnabled ? "off" : "on"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MicButton;
