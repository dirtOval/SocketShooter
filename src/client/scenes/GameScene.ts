import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import Player from '../entities/Player';

export class GameScene extends Phaser.Scene {

  inputPayload = {
    left: false,
    right: false
  }

  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  preload() {
    this.load.image('background', '../../../assets/background.png');
    this.load.image('floor', '../../../assets/floor.png');
    this.load.spritesheet('player', '../../../assets/hero_stand_run.png',
                          {frameWidth: 50, frameHeight: 50});

    this.cursorKeys = this.input.keyboard.createCursorKeys();
  }

  client = new Client("ws://localhost:3000");
  room: Room;

  playerEntities: {[sessionId: string]: any} = {};

  async create() {
    console.log('Joining game!');

    try {
      this.room = await this.client.joinOrCreate('gameroom');
      console.log('Joined successfully! :)')
    } catch (err) {
      console.log(err);
    }

    this.room.state.players.onAdd = (player, sessionId) => {
      const entity = new Player(this, player.x, player.y);

      this.playerEntities[sessionId] = entity;

      player.listen("x", (newX) => {
        entity.x = newX;
      })
    }

    this.room.state.players.onRemove = (player, sessionId) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
      }

      delete this.playerEntities[sessionId];
    }
  }

  update(time: number, delta: number): void {

    //if not connected yet, don't do any of this
    if (!this.room) {
      return;
    }

    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.room.send(0, this.inputPayload);
  }
}