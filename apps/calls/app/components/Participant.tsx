import { cn } from "@/lib/utils";
import type { User } from "@/types/signal";
import { AnimatePresence } from "framer-motion";
import { Maximize, Minimize } from "lucide-react";
import AudioLevelIndicator from "./AudioLevelIndicator";
import MuteUserButton from "./MuteUserButton";
import RaisedHandIndicator from "./RaisedHandIndicator";
import StreamMonitor from "./StreamMonitor";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ParticipantProps {
  user: User;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  isMaximize?: boolean;
  isScreenShare?: boolean;
  onZoom?: (maximize: boolean) => void;
}

const Participant: React.FC<ParticipantProps> = ({
  user,
  audioTrack,
  videoTrack,
  isMaximize,
  isScreenShare,
  onZoom,
}) => {
  return (
    <div className="bg-neutral-700 grow overflow-hidden group">
      <AnimatePresence>
        <div
          className={cn("h-full overflow-hidden", {
            "relative rounded-xl": !isMaximize,
            "absolute inset-0 h-full w-full z-10 bg-black": !!isMaximize,
          })}
        >
          <StreamMonitor className="h-full mx-auto" track={videoTrack} />

          {audioTrack && (
            <div className="absolute top-2 left-2">
              {user.tracks.audioEnabled && user.tracks.videoEnabled && (
                <AudioLevelIndicator track={audioTrack} />
              )}
            </div>
          )}

          {user.raisedHand && (
            <div className=" absolute top-2 right-2">
              <RaisedHandIndicator />
            </div>
          )}

          <div className="absolute bottom-2 left-2 text-white font-bold text-xl">
            {user.name}
          </div>

          <div className="absolute inset-0  justify-center items-center hidden group-hover:flex">
            <div className="bg-neutral-300/30 p-4 rounded-xl flex gap-2 ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => onZoom?.(!isMaximize)}>
                      {isMaximize ? <Minimize /> : <Maximize />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMaximize
                      ? "Normal this participant"
                      : "Maximize this participant"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {isScreenShare && <MuteUserButton />}
            </div>
          </div>
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Participant;
