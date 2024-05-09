import usePulledTracks from "@/hooks/usePulledTracks";
import type { ResourceID } from "@/models/P2PConnection";
import { createContext, useContext, type PropsWithChildren } from "react";
import AudioStreamTrack from "./AudioStreamTrack";

const AudioTracksContext = createContext<Record<ResourceID, MediaStreamTrack>>(
  {}
);

export const usePulledAudioTracks = () => useContext(AudioTracksContext);

export const usePulledAudioTrack = (resourceId?: ResourceID) => {
  const tracks = usePulledAudioTracks();

  return resourceId ? tracks[resourceId] : undefined;
};

interface PullAudioTracksProps {
  trackIds: string[];
}

const PullAudioTracks: React.FC<PropsWithChildren<PullAudioTracksProps>> = ({
  trackIds,
  children,
}) => {
  const audioTracksMap = usePulledTracks(trackIds as ResourceID[]);

  return (
    <AudioTracksContext.Provider value={audioTracksMap}>
      {Object.entries(audioTracksMap).map(([key, track]) => (
        <AudioStreamTrack key={key} track={track} />
      ))}
      {children}
    </AudioTracksContext.Provider>
  );
};

export default PullAudioTracks;
