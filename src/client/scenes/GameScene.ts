import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';

export class GameScene extends Phaser.Scene {
  preload() {
    // preload scene
  }

  client = new Client("ws://localhost:3000");
  room: Room;

  async create() {
    console.log('Joining game!');

    try {
      this.room = await this.client.joinOrCreate('gameroom');
      console.log('Joined successfully! :)')
    } catch (err) {
      console.log(err);
    }
  }

  update(time: number, delta: number): void {
    // game loop
  }
}