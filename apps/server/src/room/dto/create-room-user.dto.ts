import { PickType } from '@nestjs/mapped-types';
import { User } from '../entities/user.entity';

export class CreateRoomUserDto extends PickType(User, [
  'id',
  'owner',
  'streaming',
]) {}
