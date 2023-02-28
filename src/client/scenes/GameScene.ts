import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import Player from '../entities/Player';

export class GameScene extends Phaser.Scene {
  preload() {
    this.load.image('background', '../../../assets/background.png');
    this.load.image('floor', '../../../assets/floor.png');
    this.load.spritesheet('player', '../../../assets/hero_stand_run.png',
                          {frameWidth: 50, frameHeight: 50});
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
    // game loop
  }
}