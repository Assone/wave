import type Signal from "@/models/Signal";
import type { User } from "@/types/signal";
import { noop } from "@/utils/helper";
import { isUndefined } from "@/utils/is";

import { useEffect } from "react";
import useUnmount from "./useUnmount";

interface UpdateUserOptions {
  signal: Signal;
  raisedHand: boolean;
  identity?: User;
  pushedTracks: User["tracks"];
}

export default function useUpdateUser({
  signal,
  identity,
  raisedHand,
  pushedTracks,
}: UpdateUserOptions) {
  useEffect(() => {
    if (isUndefined(identity)) return noop;

    signal.send({
      type: "updateUser",
      user: { ...identity, tracks: pushedTracks, raisedHand, joined: true },
    });
  }, [identity, pushedTracks, raisedHand, signal]);

  useUnmount(() => {
    if (isUndefined(identity)) return noop;

    signal.send({
      type: "updateUser",
      user: {
        ...identity,
        tracks: pushedTracks,
        raisedHand: false,
        joined: false,
      },
    });
  });
}
