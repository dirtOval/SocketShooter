import { MapSchema, Schema, type } from '@colyseus/schema';

export class Player extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('string') facing: string;
  @type('boolean') grounded: boolean;

  //this is for queueing player inputs for processing on server tick
  inputQueue: any[] = [];
}

export class GameRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

}