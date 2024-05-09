import CameraButton from "@/components/CameraButton";
import LeaveRoomButton from "@/components/LeaveRoomButton";
import MicButton from "@/components/MicButton";
import Participant from "@/components/Participant";
import PullAudioTracks from "@/components/PullAudioTracks";
import PullVideoTrack from "@/components/PullVideoTrack";
import RaiseHandButton from "@/components/RaiseHandButton";
import ScreenShareButton from "@/components/ScreenShareButton";
import SettingsButton from "@/components/SettingsButton";
import { Button } from "@/components/ui/button";
import useRoomProvider from "@/hooks/useRoomProvider";
import useRoomSound from "@/hooks/useRoomSounds";
import useUpdateUser from "@/hooks/useUpdateUser";
import useUserJoinOrLeaveToast from "@/hooks/useUserJoinOrLeaveToast";

import { isNonNullable } from "@/utils/is";
import { useNavigate, useParams } from "@remix-run/react";
import { LayoutGroup } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

declare module "react" {
  interface CSSProperties {
    "--grid-cols"?: string;
  }
}

function useGridDebugControls(
  {
    initialCount,
    defaultEnabled,
  }: {
    initialCount: number;
    defaultEnabled: boolean;
  } = { initialCount: 0, defaultEnabled: false },
) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [fakeUsers, setFakeUsers] = useState<string[]>(
    Array.from({ length: initialCount }).map(() => crypto.randomUUID()),
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d" && e.ctrlKey) {
        e.preventDefault();
        setEnabled(!enabled);
      }
    };
    document.addEventListener("keypress", handler);

    return () => {
      document.removeEventListener("keypress", handler);
    };
  }, [enabled]);

  const GridDebugControls = useCallback(
    () =>
      enabled ? (
        <>
          <Button
            onClick={() => setFakeUsers((fu) => [...fu, crypto.randomUUID()])}
          >
            <Plus />
          </Button>
          <Button
            onClick={() => {
              setFakeUsers((fu) => {
                const randomLeaver = fu[Math.floor(Math.random() * fu.length)];
                return fu.filter((x) => x !== randomLeaver);
              });
            }}
          >
            <Minus />
          </Button>
        </>
      ) : null,
    [enabled],
  );

  return {
    GridDebugControls,
    fakeUsers,
  };
}

const Room: React.FC = () => {
  const navigate = useNavigate();
  const {
    joined,
    room: { identity, otherUsers, signal },
    pushedTracks,
    userMedia,
  } = useRoomProvider();
  const { roomName } = useParams();

  const audioTracks = useMemo(
    () => otherUsers.map((user) => user.tracks.audio).filter(isNonNullable),
    [otherUsers],
  );

  const { GridDebugControls, fakeUsers } = useGridDebugControls({
    defaultEnabled: true,
    initialCount: 0,
  });

  const [raisedHand, setRaisedHand] = useState(false);

  const [pinnedId, setPinnedId] = useState<string>();

  const onSetMaximize = (pinnedId: string) => (isMaximize: boolean) => {
    setPinnedId(isMaximize ? pinnedId : undefined);
  };

  useUpdateUser({
    signal,
    raisedHand,
    identity,
    pushedTracks,
  });

  useRoomSound(otherUsers);
  useUserJoinOrLeaveToast(otherUsers);

  useEffect(() => {
    if (joined === false) {
      navigate(`/${roomName}`);
    }
  }, [joined, navigate, roomName]);

  return (
    <PullAudioTracks trackIds={audioTracks}>
      <div className="flex flex-col h-full">
        <div
          className="relative flex-grow overflow-hidden"
          style={{ "--grid-cols": `repeat(auto-fit, minmax(200px, 1fr))` }}
        >
          <LayoutGroup>
            <div className=" absolute h-full w-full p-4 bg-black grid gap-2 grid-cols-[--grid-cols]">
              {identity && userMedia.audioStreamTrack && (
                <Participant
                  user={identity}
                  videoTrack={userMedia.videoStreamTrack}
                  isMaximize={pinnedId === "identity"}
                  onZoom={onSetMaximize("identity")}
                />
              )}

              {identity &&
                userMedia.screenShareStreamTrack &&
                userMedia.screenShareEnabled && (
                  <Participant
                    user={identity}
                    videoTrack={userMedia.screenShareStreamTrack}
                    isScreenShare
                    isMaximize={pinnedId === "identity - screen"}
                    onZoom={onSetMaximize("identity - screen")}
                  />
                )}

              {otherUsers.map((user) => (
                <Fragment key={user.id}>
                  <PullVideoTrack
                    audio={user.tracks.audio}
                    video={user.tracks.video}
                  >
                    {({ audioTrack, videoTrack }) => (
                      <Participant
                        user={user}
                        videoTrack={videoTrack}
                        audioTrack={audioTrack}
                        isMaximize={pinnedId === user.id}
                        onZoom={onSetMaximize(user.id)}
                      />
                    )}
                  </PullVideoTrack>
                  {user.tracks.screen && user.tracks.screenShareEnabled && (
                    <PullVideoTrack video={user.tracks.screen}>
                      {({ videoTrack }) => (
                        <Participant
                          user={user}
                          videoTrack={videoTrack}
                          isScreenShare
                          isMaximize={pinnedId === `${user.id} - screen`}
                          onZoom={onSetMaximize(`${user.id} - screen`)}
                        />
                      )}
                    </PullVideoTrack>
                  )}
                </Fragment>
              ))}

              {identity &&
                userMedia.audioStreamTrack &&
                fakeUsers.map((id) => (
                  <Participant
                    key={id}
                    user={identity}
                    videoTrack={userMedia.videoStreamTrack}
                    isMaximize={id === pinnedId}
                    onZoom={onSetMaximize(id)}
                  />
                ))}
            </div>
          </LayoutGroup>
        </div>

        <div className="flex gap-2 p-2 justify-center items-center">
          {import.meta.env.DEV && <GridDebugControls />}
          <ScreenShareButton />
          <CameraButton />
          <MicButton />
          <RaiseHandButton up={raisedHand} onChange={setRaisedHand} />
          <SettingsButton />
          <LeaveRoomButton />
        </div>
      </div>
    </PullAudioTracks>
  );
};

export default Room;
