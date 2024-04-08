import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { v4 as uuid } from 'uuid';
import type { CreateAnswerDto } from './dto/create-answer.dto';
import type { CreateIceCandidateDto } from './dto/create-ice-candidate.dto';
import type { CreateOfferDto } from './dto/create-offer.dto';
import type { JoinDto } from './dto/join.dto';
import { Message } from './entities/message.entity';
import type { ClientInterface } from './interfaces/client.interface';
import type { P2PMessage } from './interfaces/p2p-message.interface';
import RoomManager from './models/RoomManager';
import { RoomService } from './room.service';

@WebSocketGateway({
  cors: '*',
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  logger = new Logger(RoomGateway.name);

  @WebSocketServer()
  server: Server;

  connectionPool = new Map<string, ClientInterface>();

  roomManager = new RoomManager();

  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: ClientInterface) {
    this.connectionPool.set(client.id, client);
    this.logger.log(
      `client id: ${client.id} connected, connection pool length: ${this.connectionPool.size}`,
    );

    client.emit('connected', client.id);
  }

  async handleDisconnect(client: ClientInterface) {
    this.connectionPool.delete(client.id);
    this.logger.log(
      `client id: ${client.id} disconnect, connection pool length: ${this.connectionPool.size}`,
    );

    const { roomId } = client.data;
    const room = this.roomManager.rooms.get(roomId);
    const user = room?.users.get(client.id);

    if (!roomId || !room) return;

    if (room.closeOnOwnerLeave && room.owner?.id === user?.id) {
      this.roomManager.rooms.delete(roomId);
      return;
    }

    if (user?.streaming) {
      room.removeSessionByHostId(client.id);
    }

    room.users.delete(client.id);
    room.removeSessionByClientId(client.id);
  }

  @SubscribeMessage('offer')
  async offer(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() createOfferDto: CreateOfferDto,
  ) {
    const roomId = client.data.roomId;
    const message = new Message<
      P2PMessage<{ offer: RTCSessionDescriptionInit }>
    >('answer', '', 200, createOfferDto);

    client.to(roomId).emit('offer', message);
  }

  @SubscribeMessage('answer')
  async answer(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() createAnswerDto: CreateAnswerDto,
  ) {
    const roomId = client.data.roomId;
    const message = new Message<
      P2PMessage<{ answer: RTCSessionDescriptionInit }>
    >('answer', '', 200, createAnswerDto);

    client.to(roomId).emit('answer', message);
  }

  @SubscribeMessage('addIceCandidate')
  async addIceCandidate(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() createIceCandidateDto: CreateIceCandidateDto,
  ) {
    const roomId = client.data.roomId;
    const message = new Message<
      P2PMessage<{ type: 'host' | 'client'; candidate: RTCIceCandidate }>,
      'iceCandidate'
    >('iceCandidate', '', 200, createIceCandidateDto);

    client.to(roomId).emit('addIceCandidate', message);
  }

  @SubscribeMessage('join')
  async join(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() joinDto: JoinDto,
  ) {
    this.roomManager.join(joinDto.roomId, client.id, joinDto);

    client.data.roomId = joinDto.roomId;
    // client.data.owner = newUser.owner;
    client.join(joinDto.roomId);

    const users = this.roomManager.getRoomUsers(joinDto.roomId);
    const room = this.roomManager.rooms.get(joinDto.roomId);

    for (const [userId, user] of users) {
      const connection = this.connectionPool.get(userId);

      if (
        client.id === userId ||
        user.streaming === false ||
        connection === undefined
      )
        continue;

      const id = uuid();
      room.createSession(id, user.id, client.id);

      const createHostSessionMessage = new Message<P2PMessage>(
        'createHostSession',
        '',
        200,
        { sid: id },
      );
      const createClientSessionMessage = new Message<P2PMessage>(
        'createClientSession',
        '',
        200,
        {
          sid: id,
        },
      );

      connection.emit('createHostSession', createHostSessionMessage);
      client.emit('createClientSession', createClientSessionMessage);
    }
  }

  @SubscribeMessage('share')
  async share(
    @ConnectedSocket()
    client: ClientInterface,
  ) {
    this.logger.log(`start share, client id: ${client.id}`);

    const { roomId } = client.data;
    const room = this.roomManager.rooms.get(roomId);
    const user = room?.users.get(client.id);

    if (user) {
      user.streaming = true;
    }

    if (room.users.size < 2) return;

    const id = uuid();

    const createHostSessionMessage = new Message<P2PMessage>(
      'createHostSession',
      '',
      200,
      { sid: id },
    );
    const createClientSessionMessage = new Message<P2PMessage>(
      'createClientSession',
      '',
      200,
      { sid: id },
    );

    client.emit('createHostSession', createHostSessionMessage);

    for (const [userId] of room.users) {
      const hasConnection = this.connectionPool.has(userId);
      if (client.id === userId || hasConnection === false) continue;

      room.createSession(id, client.id, userId);
    }

    client.to(roomId).emit('createClientSession', createClientSessionMessage);
  }

  @SubscribeMessage('stopShare')
  async stopShareScreen(@ConnectedSocket() client: ClientInterface) {
    const room = this.roomManager.rooms.get(client.data.roomId);
    const user = room.users.get(client.id);

    user.streaming = false;

    for (const [sid, session] of room.sessions) {
      if (user.id === session.hostId) {
        const connection = this.connectionPool.get(user.id);
        const message = new Message<P2PMessage>('stopShare', '', 200, { sid });

        connection?.emit('stopShare', message);
      }
    }

    room.removeSessionByHostId(client.id);
  }
}
