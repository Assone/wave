import type { Socket } from 'socket.io';
import type { Message } from '../entities/message.entity';
import type { ClientInfoInterface } from './client-info.interface';
import type { P2PMessage } from './p2p-message.interface';

interface ListenEvents {}

interface EmitEvents {
  connected: (id: string) => void;

  addIceCandidate: (
    data: Message<
      P2PMessage<{ type: 'host' | 'client'; candidate: RTCIceCandidate }>,
      'iceCandidate'
    >,
  ) => void;
  offer: (
    data: Message<P2PMessage<{ offer: RTCSessionDescriptionInit }>>,
  ) => void;
  answer: (
    data: Message<P2PMessage<{ answer: RTCSessionDescriptionInit }>>,
  ) => void;

  createHostSession: (session: Message<P2PMessage>) => void;
  createClientSession: (session: Message<P2PMessage>) => void;

  stopShare: (message: Message<P2PMessage>) => void;
}

interface ServerSideEvents {}

interface SocketData extends ClientInfoInterface {}

export type ClientInterface = Socket<
  ListenEvents,
  EmitEvents,
  ServerSideEvents,
  SocketData
>;
