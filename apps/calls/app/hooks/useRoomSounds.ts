import type { User } from "@/types/signal";
import usePrevious from "./usePrevious";

import join from "@/assets/sounds/Join.mp3";
import leave from "@/assets/sounds/Leave.mp3";
import raiseHand from "@/assets/sounds/RaiseHand.mp3";
import fetchOnce from "@/utils/fetchOnce";
import { createSound } from "@/utils/sound";
import { useEffect, useMemo } from "react";
import useMounted from "./useMounted";
import useUnmount from "./useUnmount";

const sounds = {
  join,
  leave,
  raiseHand,
};

const volumeMap = {
  join: 0.2,
  leave: 0.2,
  raiseHand: 0.1,
} satisfies Record<keyof typeof sounds, number>;

export const playSound = async (type: keyof typeof sounds) => {
  const buffer = await fetchOnce(sounds[type]).then((res) => res.arrayBuffer());
  const { source, context, gainNode, connect } = createSound();

  const audioBuffer = await context.decodeAudioData(buffer);
  source.buffer = audioBuffer;

  connect();

  gainNode.gain.setValueAtTime(volumeMap[type], context.currentTime);

  source.start();
};

export default function useRoomSound(users: User[]) {
  const previousUsersCount = usePrevious(users.length);
  const raisedHandCount = useMemo(
    () => users.filter((user) => user.raisedHand).length,
    [users]
  );
  const previousRaisedHandCount = usePrevious(raisedHandCount);

  useEffect(() => {
    if (
      users.length > 5 ||
      previousUsersCount === undefined ||
      previousUsersCount === users.length
    ) {
      return;
    }

    if (users.length > previousUsersCount) {
      playSound("join");
    } else {
      playSound("leave");
    }
  }, [previousUsersCount, users.length]);

  useEffect(() => {
    if (
      previousRaisedHandCount === undefined ||
      raisedHandCount === previousRaisedHandCount
    ) {
      return;
    }

    if (raisedHandCount > previousRaisedHandCount) {
      playSound("raiseHand");
    }
  }, [previousRaisedHandCount, raisedHandCount]);

  useMounted(() => {
    playSound("join");
  });

  useUnmount(() => {
    playSound("leave");
  });
}
