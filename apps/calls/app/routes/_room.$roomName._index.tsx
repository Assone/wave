import AudioLevelIndicator from "@/components/AudioLevelIndicator";
import CameraButton from "@/components/CameraButton";
import CopyButton from "@/components/CopyButton";
import MicButton from "@/components/MicButton";
import SettingsButton from "@/components/SettingsButton";
import StreamMonitor from "@/components/StreamMonitor";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useRoomProvider from "@/hooks/useRoomProvider";
import { getUsername } from "@/utils/username";
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useNavigate, useParams } from "@remix-run/react";
import { useMemo } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const username = await getUsername(request);

  return json({ username });
};

const Room: React.FC = () => {
  const { roomName } = useParams();
  const { userMedia, room, setJoined } = useRoomProvider();
  const { videoStreamTrack } = userMedia;
  const navigate = useNavigate();

  const onLineCount = useMemo(
    () => room.otherUsers.filter((user) => user.joined).length,
    [room.otherUsers]
  );

  const onJoin = () => {
    setJoined(true);
    navigate("room");
  };

  return (
    <div className="flex justify-center items-center h-full flex-col">
      <Card>
        <CardHeader>
          <CardTitle>{roomName}</CardTitle>
          <CardDescription>Online: {onLineCount}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative rounded-xl overflow-hidden">
            <AspectRatio ratio={4 / 3}>
              <StreamMonitor track={videoStreamTrack} />
            </AspectRatio>

            {userMedia.audioStreamTrack && (
              <div className="absolute top-2 left-2">
                {userMedia.audioEnabled && (
                  <AudioLevelIndicator track={userMedia.audioStreamTrack} />
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-evenly">
          {userMedia.audioUnavailableReason ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button disabled>Join</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Unable to join without a mic</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button onClick={onJoin}>Join</Button>
          )}
          <CameraButton />
          <MicButton />
          <SettingsButton />
          <CopyButton />
        </CardFooter>
      </Card>
    </div>
  );
};

export default Room;
