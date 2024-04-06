import { PickType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';

export class RemoveSessionDto extends PickType(CreateSessionDto, [
  'roomId',
  'userId',
  'sid',
]) {}
