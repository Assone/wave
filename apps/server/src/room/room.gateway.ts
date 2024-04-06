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
import { CreateRoomUserDto } from './dto/create-room-user.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import type { JoinDto } from './dto/join.dto';
import { Message } from './entities/message.entity';
import type { ClientInterface } from './interfaces/client.interface';
import type { P2PMessage } from './interfaces/p2p-message.interface';
import { RoomService } from './room.service';

@WebSocketGateway({
  cors: '*',
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  logger = new Logger(RoomGateway.name);

  @WebSocketServer()
  server: Server;

  connectionPool = new Map<string, ClientInterface>();

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

    const { roomId, owner, streaming } = client.data;
    const room = await this.roomService.findRoom(roomId);

    if (!roomId || !room) return;

    if (room.closeOnOwnerLeave && owner) {
      await this.roomService.removeRoom(roomId);
      return;
    }

    if (streaming) {
      await this.roomService.removeRoomSession(roomId, client.id);
    }

    await this.roomService.removeRoomUser(roomId, client.id);
  }

  @SubscribeMessage('offer')
  async offer(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() createOfferDto: CreateOfferDto,
  ) {
    const roomId = client.data.roomId;
    // const users = await this.roomService.findRoomUser(roomId);
    const message = new Message<
      P2PMessage<{ offer: RTCSessionDescriptionInit }>
    >('answer', '', 200, createOfferDto);

    // for (let i = 0; i < users.length; i++) {
    //   const user = users[i];
    //   const connection = this.connectionPool.get(user.id);

    //   if (client.id === user.id || connection === undefined) continue;

    //   connection.emit('offer', message);
    // }
    client.to(roomId).emit('offer', message);
  }

  @SubscribeMessage('answer')
  async answer(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() createAnswerDto: CreateAnswerDto,
  ) {
    const roomId = client.data.roomId;
    // const users = await this.roomService.findRoomUser(roomId);
    const message = new Message<
      P2PMessage<{ answer: RTCSessionDescriptionInit }>
    >('answer', '', 200, createAnswerDto);

    // for (let i = 0; i < users.length; i++) {
    //   const user = users[i];
    //   const connection = this.connectionPool.get(user.id);

    //   if (client.id === user.id || connection === undefined) continue;

    //   connection.emit('answer', message);
    // }

    client.to(roomId).emit('answer', message);
  }

  @SubscribeMessage('addIceCandidate')
  async addIceCandidate(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() createIceCandidateDto: CreateIceCandidateDto,
  ) {
    const roomId = client.data.roomId;
    // const users = await this.roomService.findRoomUser(roomId);
    const message = new Message<
      P2PMessage<{ type: 'host' | 'client'; candidate: RTCIceCandidate }>,
      'iceCandidate'
    >('iceCandidate', '', 200, createIceCandidateDto);

    // for (let i = 0; i < users.length; i++) {
    //   const user = users[i];
    //   const connection = this.connectionPool.get(user.id);

    //   if (client.id === user.id || connection === undefined) continue;

    //   connection.emit('addIceCandidate', message);
    // }
    client.to(roomId).emit('addIceCandidate', message);
  }

  @SubscribeMessage('join')
  async join(
    @ConnectedSocket()
    client: ClientInterface,
    @MessageBody() joinDto: JoinDto,
  ) {
    const room = await this.roomService.findRoom(joinDto.roomId);
    const owner = room === null ? true : false;

    client.data.roomId = joinDto.roomId;
    client.data.owner = owner;
    client.join(joinDto.roomId);

    const createRoomUser = new CreateRoomUserDto();
    createRoomUser.id = client.id;
    createRoomUser.streaming = false;
    createRoomUser.owner = owner;

    if (!room) {
      client.data.owner = true;

      const createRoomDto = new CreateRoomDto();
      createRoomDto.id = joinDto.roomId;
      createRoomDto.closeOnOwnerLeave = joinDto.autoClose;

      await this.roomService.createRoom(createRoomDto);
    }

    await this.roomService.createRoomUser(joinDto.roomId, createRoomUser);

    const users = await this.roomService.findRoomUser(joinDto.roomId);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userConnection = this.connectionPool.get(user.id);

      if (
        client.id === user.id ||
        user.streaming === false ||
        userConnection === undefined
      ) {
        continue;
      }

      const id = uuid();
      const createSession = new CreateSessionDto();

      createSession.roomId = joinDto.roomId;
      createSession.hostId = user.id;
      createSession.clientId = client.id;
      createSession.sid = id;

      this.roomService.createRoomSession(createSession);

      const createClientSessionMessage = new Message<P2PMessage>(
        'createClientSession',
        '',
        200,
        {
          sid: id,
        },
      );
      const createHostSessionMessage = new Message<P2PMessage>(
        'createHostSession',
        '',
        200,
        { sid: id },
      );

      userConnection.emit('createHostSession', createHostSessionMessage);
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
    const users = await this.roomService.findRoomUser(roomId);

    client.data.streaming = true;
    this.roomService.updateRoomUser(roomId, client.id, { streaming: true });

    if (users.length < 1) return;

    const id = uuid();
    const createHostSessionMessage = new Message<P2PMessage>(
      'createHostSession',
      '',
      200,
      { sid: id },
    );

    client.emit('createHostSession', createHostSessionMessage);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userConnection = this.connectionPool.get(user.id);

      if (client.id === user.id || userConnection === undefined) {
        continue;
      }

      const createSession = new CreateSessionDto();
      createSession.roomId = roomId;
      createSession.hostId = client.id;
      createSession.clientId = user.id;
      createSession.sid = id;

      this.roomService.createRoomSession(createSession);

      if (userConnection === undefined) continue;

      const createClientSessionMessage = new Message<P2PMessage>(
        'createClientSession',
        '',
        200,
        { sid: id },
      );

      userConnection.emit('createClientSession', createClientSessionMessage);
    }
  }

  @SubscribeMessage('stopShare')
  async stopShareScreen(@ConnectedSocket() client: ClientInterface) {
    client.data.streaming = false;
    const sessions = await this.roomService.findRoomSessionByUserId(
      client.data.roomId,
      client.id,
    );

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const { sid, clientId } = session;
      const connection = this.connectionPool.get(clientId);

      const message = new Message<P2PMessage>('stopShare', '', 200, { sid });

      connection?.emit('stopShare', message);
    }
  }
}
