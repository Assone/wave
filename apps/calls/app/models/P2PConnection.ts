import {
  TrackObject,
  type ErrorResponse,
  type TracksResponse,
} from "@/routes/api.calls.$";
import { noop } from "@/utils/helper";
import { isUndefined } from "@/utils/is";
import invariant from "tiny-invariant";
import BulkDispatcher from "./BulkDispatcher";
import CallsServices from "./CallsServices";
import FIFOScheduler from "./FIFOScheduler";
import Logger from "./Logger";

type SessionId = string;
type TrackName = string;

export type ResourceID = `${SessionId}/${TrackName}`;

type PushTrackRequestEntry = {
  trackName: string;
  track: MediaStreamTrack;
  transceiver: RTCRtpTransceiver;
};

export default class P2PConnection {
  sessionId?: string;

  connection = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.cloudflare.com:3478" },
      // { urls: "stun:stun.l.google.com:19302" },
    ],
    bundlePolicy: "max-bundle",
  });

  private transceivers: RTCRtpTransceiver[] = [];

  private pendingTrackTransceivers = new Map<
    string,
    (track: MediaStreamTrack) => void
  >();

  private callsServices = new CallsServices();

  private logger = new Logger(P2PConnection.name);

  private pushTrackDispatcher = new BulkDispatcher<
    PushTrackRequestEntry,
    TracksResponse
  >();

  private pullTrackDispatcher = new BulkDispatcher<
    TrackObject,
    {
      bulkResponse: TracksResponse & ErrorResponse;
      trackPromises: (Promise<MediaStreamTrack> | undefined)[];
    }
  >();

  private closeTrackDispatcher = new BulkDispatcher<string, TracksResponse>();

  private scheduler = new FIFOScheduler();

  private trackIdToMid: Record<string, string> = {};

  private initialization: Promise<boolean>;

  private unRegisterListeners = noop;

  constructor() {
    this.initialization = this.init();
  }

  //#region Connection init

  private async init() {
    this.unRegisterListeners = this.registerListener();

    this.transceivers.push(
      this.connection.addTransceiver("audio", { direction: "inactive" }),
    );

    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);

    const response = await this.callsServices.createSession({
      sessionDescription: offer,
    });

    this.sessionId = response.sessionId;
    await this.connection.setRemoteDescription(response.sessionDescription);

    return new Promise<boolean>((resolve) => {
      this.connection.addEventListener("connectionstatechange", () => {
        if (this.connection.connectionState === "connected") {
          resolve(true);
        }
      });
    });
  }

  destroy() {
    this.connection.close();

    this.unRegisterListeners();
  }

  //#region Event Listener

  private registerListener() {
    const onTrackListener = (event: RTCTrackEvent) => {
      const { mid } = event.transceiver;

      if (mid === null) return;

      const callback = this.pendingTrackTransceivers.get(mid);

      if (callback) {
        this.pendingTrackTransceivers.delete(mid);
        callback(event.track);
      } else {
        console.warn("No pending track for transceiver", event.transceiver);
      }
    };

    const onIceConnectionStateChangeListener = () => {
      iceConnectionFailHandler();
    };

    const iceConnectionFailHandler = async () => {
      const { iceConnectionState } = this.connection;

      if (iceConnectionState === "closed" || iceConnectionState === "failed") {
        alert(
          `Oh no! It appears that your connection closed unexpectedly. We've copied your session id to your clipboard, and will now reload the page to reconnect!`,
        );
        if (this.sessionId) {
          await navigator.clipboard.writeText(this.sessionId);
        }
        window.location.reload();
      }
    };

    this.connection.addEventListener("track", onTrackListener);
    this.connection.addEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChangeListener,
    );

    return () => {
      this.connection.removeEventListener("track", onTrackListener);
      this.connection.removeEventListener(
        "iceconnectionstatechange",
        onIceConnectionStateChangeListener,
      );
    };
  }

  //#region Transceiver Method

  private getTransceiverForTrack(track: MediaStreamTrack) {
    const transceiver = this.connection.addTransceiver(track, {
      direction: "sendonly",
    });
    this.transceivers.push(transceiver);

    return transceiver;
  }

  private addPendingTrackTransceivers(mid: string) {
    return new Promise<MediaStreamTrack>((resolve, reject) => {
      setTimeout(reject, 10000, "track resolve time out");

      this.pendingTrackTransceivers.set(mid, resolve);
    });
  }

  //#region Track Method

  async push(trackId: string, track: MediaStreamTrack) {
    await this.initialization;

    this.logger.debug(track.kind, trackId, "push");

    const bulkResponse = await this.pushTrackDispatcher.exec(
      {
        trackName: trackId,
        track,
        transceiver: this.getTransceiverForTrack(track),
      },
      (bulkData) =>
        this.scheduler.schedule(async () => {
          const offer = await this.connection.createOffer();
          await this.connection.setLocalDescription(offer);

          const response = await this.callsServices.addNewTrack({
            tracks: bulkData.map((entry) => ({
              location: "local",
              mid: entry.transceiver.mid,
              trackName: entry.trackName,
            })),
            sessionDescription: offer,
          });

          if (!response.errorCode) {
            await this.connection.setRemoteDescription(
              response.sessionDescription,
            );
          }

          return response;
        }),
    );

    const trackResponse = bulkResponse.tracks?.find(
      (track) => track.trackName === trackId,
    );

    if (isUndefined(trackResponse)) {
      throw new Error(`No response for trackName=${trackId}`);
    }

    if (trackResponse.errorCode) {
      throw new Error(
        `${trackResponse.errorCode}: ${trackResponse.errorDescription}`,
      );
    }

    invariant(trackResponse.mid);

    this.trackIdToMid[trackId] = trackResponse.mid;

    return {
      location: "remote",
      sessionId: this.sessionId,
      trackId,
    };
  }

  async pull(data: TrackObject) {
    this.logger.debug(data, "pull");

    const { bulkResponse, trackPromises } = await this.pullTrackDispatcher.exec(
      data,
      (bulkData) =>
        this.scheduler.schedule<{
          bulkResponse: TracksResponse;
          trackPromises: (Promise<MediaStreamTrack> | undefined)[];
        }>(async () => {
          const response = await this.callsServices.addNewTrack({
            tracks: bulkData,
          });

          invariant(response.tracks);

          const trackPromises = response.tracks.map((track) => {
            if (track.mid) {
              return this.addPendingTrackTransceivers(track.mid);
            }
          });

          if (response.requiresImmediateRenegotiation) {
            await this.connection.setRemoteDescription(
              response.sessionDescription,
            );

            const answer = await this.connection.createAnswer();
            await this.connection.setLocalDescription(answer);
            await this.callsServices.renegotiateSession({
              sessionDescription: answer,
            });
          }

          return { bulkResponse: response, trackPromises };
        }),
    )!;

    const index = bulkResponse.tracks?.findIndex(
      (track) =>
        track.sessionId === data.sessionId &&
        track.trackName === data.trackName,
    );

    if (!bulkResponse.tracks || index === undefined || index === -1) {
      throw new Error(
        `No response for sessionId=${data.sessionId}, trackName=${data.trackName}`,
      );
    }

    const trackResponse = bulkResponse.tracks[index];
    const promise = trackPromises[index];

    if (trackResponse?.errorCode) {
      throw new Error(trackResponse.errorDescription);
    }

    invariant(promise);
    invariant(trackResponse?.mid);

    const track = await promise;

    this.trackIdToMid[track.id] = trackResponse.mid;

    return track;
  }

  replace(resourceId: ResourceID, track: MediaStreamTrack) {
    const [, trackId] = resourceId.split("/") as [string, string];
    const mid = this.trackIdToMid[trackId];

    invariant(mid, `mid for ${trackId} not found`);

    const sender = this.connection
      .getTransceivers()
      .find((transceiver) => transceiver.mid === mid)?.sender;

    invariant(sender, `sender for ${resourceId} not found`);

    this.trackIdToMid[track.id] = mid;
    sender.replaceTrack(track);

    return resourceId.replace(trackId, track.id);
  }

  async close(track: MediaStreamTrack) {
    const mid = this.trackIdToMid[track.id];

    invariant(mid, "stream has no associated transceiver");

    await this.initialization;

    const tracksResponse = await this.closeTrackDispatcher.exec(
      mid,
      (bulkData) =>
        this.scheduler.schedule(async () => {
          const transceivers = this.connection
            .getTransceivers()
            .filter((transceiver) =>
              transceiver.mid ? bulkData.includes(transceiver.mid) : false,
            );

          transceivers.forEach((transceiver) => {
            transceiver.direction = "inactive";
          });

          const offer = await this.connection.createOffer();
          await this.connection.setLocalDescription(offer);

          const response = await this.callsServices.closeTrack({
            tracks: bulkData.map((id) => ({ mid: id })),
            sessionDescription: offer,
            force: false,
          });

          if (response.errorCode) {
            throw new Error(response.errorDescription);
          }

          await this.connection.setRemoteDescription(
            response.sessionDescription,
          );

          return response;
        }),
    );

    invariant(tracksResponse, `No response for mid: ${mid}`);

    if (tracksResponse.errorCode) {
      throw new Error(tracksResponse.errorDescription);
    }

    delete this.trackIdToMid[mid];
    this.transceivers = this.transceivers.filter(
      (transceiver) => transceiver.mid !== mid,
    );
  }
}
