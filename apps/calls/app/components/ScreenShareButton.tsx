import useRoomProvider from "@/hooks/useRoomProvider";
import { cn } from "@/lib/utils";
import { isString } from "@/utils/is";
import { ScreenShare, ScreenShareOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const ScreenShareButton: React.FC = () => {
  const { userMedia } = useRoomProvider();
  const {
    screenShareEnabled,
    screenShareUnavailableReason,
    startScreenShare,
    stopScreenShare,
    isSupportScreenShare,
  } = userMedia;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn({ hidden: isSupportScreenShare === false })}
          asChild
        >
          <Button
            variant={screenShareEnabled ? "destructive" : "default"}
            disabled={isString(screenShareUnavailableReason)}
            onClick={screenShareEnabled ? stopScreenShare : startScreenShare}
          >
            {screenShareEnabled ? <ScreenShareOff /> : <ScreenShare />}
          </Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>Turn screen share {screenShareEnabled ? "off" : "on"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScreenShareButton;
