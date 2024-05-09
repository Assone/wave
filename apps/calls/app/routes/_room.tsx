import EnsureOnline from "@/components/EnsureOnline";
import EnsurePermissions from "@/components/EnsurePermissions";
import useP2PConnection from "@/hooks/useP2PConnection";
import usePushedTrack from "@/hooks/usePushedTrack";
import useRoom from "@/hooks/useRoom";
import type { RoomContext } from "@/hooks/useRoomProvider";
import useUserMedia from "@/hooks/useUserMedia";
import { Outlet, useParams } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

const RoomWithPermissions: React.FC = () => {
  return (
    <EnsureOnline
      fallback={
        <div className="h-full flex justify-center items-center bg-neutral-800 text-neutral-500">
          <p className="text-4xl font-bold">You are offline</p>
        </div>
      }
    >
      <EnsurePermissions>
        <Room />
      </EnsurePermissions>
    </EnsureOnline>
  );
};

const Room: React.FC = () => {
  const [joined, setJoined] = useState(false);
  const { roomName } = useParams();

  invariant(roomName);

  const { connection } = useP2PConnection();
  const userMedia = useUserMedia();
  const room = useRoom(roomName);

  const pushedVideoTransceiverId = usePushedTrack(
    connection,
    userMedia.videoStreamTrack
  );
  const pushedAudioTransceiverId = usePushedTrack(
    connection,
    userMedia.audioStreamTrack
  );
  const pushedScreenTransceiverId = usePushedTrack(
    connection,
    userMedia.screenShareStreamTrack
  );

  const { videoEnabled, audioEnabled, screenShareEnabled } = userMedia;

  const context: RoomContext = {
    connection,
    userMedia,
    joined,
    setJoined,
    room,
    pushedTracks: {
      video: pushedVideoTransceiverId,
      audio: pushedAudioTransceiverId,
      screen: pushedScreenTransceiverId,
      videoEnabled,
      audioEnabled,
      screenShareEnabled,
    },
  };

  return <Outlet context={context} />;
};

export default RoomWithPermissions;
