import { MapSchema, ArraySchema, Schema, type } from '@colyseus/schema';

export class Bullet extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('string') direction: string;
}

export class Player extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('string') facing: string;
  @type('boolean') jumping: boolean;
  @type('number') velocityY: number;
  @type('boolean') canFire: boolean;
  @type([ Bullet ]) bullets = new ArraySchema<Bullet>();

  //this is for queueing player inputs for processing on server tick
  inputQueue: any[] = [];
}

export class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

}