import usePulledTrack from "@/hooks/usePulledTrack";
import type { ResourceID } from "@/models/P2PConnection";
import type { ReactElement } from "react";
import { usePulledAudioTrack } from "./PullAudioTracks";

interface PullVideoTrackProps {
  audio?: ResourceID;
  video?: ResourceID;
  children: (props: {
    videoTrack?: MediaStreamTrack;
    audioTrack?: MediaStreamTrack;
  }) => ReactElement;
}

const PullVideoTrack: React.FC<PullVideoTrackProps> = ({
  audio,
  video,
  children,
}) => {
  const audioTrack = usePulledAudioTrack(audio);
  const videoTrack = usePulledTrack(video);

  return children({ audioTrack, videoTrack });
};

export default PullVideoTrack;
