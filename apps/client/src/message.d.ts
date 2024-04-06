export interface Message<
  D,
  T extends string = string,
  M extends string = string,
> {
  type: T;
  message: M;
  status: number;
  data: D;
}
export type P2PMessage<T extends Record<string, unknown> = object> = {
  sid: string;
} & T;

// ---------- Event Data
export type IceCandidateMessage = Message<
  P2PMessage<{ type: "client" | "host"; candidate: RTCIceCandidate }>,
  "iceCandidate"
>;
export type HostOfferMessage = Message<
  P2PMessage<{ offer: RTCSessionDescriptionInit }>
>;
export type ClientAnswerMessage = Message<
  P2PMessage<{ answer: RTCSessionDescriptionInit }>
>;
export type CreateHostSession = Message<P2PMessage>;
export type CreateClientSession = Message<P2PMessage>;
export type StopShareMessage = Message<P2PMessage>;

// ---------- Emit Data
export type AddIceCandidateData = P2PMessage<{
  type: "client" | "host";
  candidate: RTCIceCandidate;
}>;
export type OfferData = P2PMessage<{ offer: RTCSessionDescriptionInit }>;
export type AnswerData = P2PMessage<{ answer: RTCSessionDescriptionInit }>;
export type JoinData = { roomId: string; autoClose: boolean };
