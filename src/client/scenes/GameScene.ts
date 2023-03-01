import Phaser from 'phaser';
import { Client, Room } from 'colyseus.js';
import Player from '../entities/Player';

const backgroundImage = require('../../assets/background.png');
const floorImage = require('../../assets/floor.png');
const playerSheet = require('../../assets/hero_stand_run.png');

const MOVE_SPEED = 6;

export class GameScene extends Phaser.Scene {

  currentPlayer: Player;
  remoteRef: Phaser.GameObjects.Rectangle;

  inputPayload = {
    left: false,
    right: false,
    jump: false
  }


  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  preload() {
    this.load.image('background', backgroundImage);
    this.load.image('floor', floorImage);
    this.load.spritesheet('player', playerSheet,
                          {frameWidth: 50, frameHeight: 50, endFrame: 19});

    this.cursorKeys = this.input.keyboard.createCursorKeys();



  }

  client = new Client("ws://localhost:3000");
  room: Room;

  playerEntities: {[sessionId: string]: any} = {};

  async create() {
    console.log('Joining game!');

    const background = this.add.image(0, 0, 'background').setOrigin(0);

    const floor = this.physics.add.staticSprite(0, 909, 'floor').setOrigin(0).refreshBody();


    //set world size
    this.physics.world.setBounds(0, 0, 2250, 1410);

    // this.cameras.main.setViewport(0, 0, 800, 600);

    //player animations
    this.anims.create({
      key: 'standRight',
      frames:[ { key: 'player', frame: 8 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'standLeft',
      frames: [ { key: 'player', frame: 9 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'moveRight',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7}),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'moveLeft',
      frames: this.anims.generateFrameNumbers('player', { start: 10, end: 17 }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'jumpRight',
      frames: [ { key: 'player', frame: 18 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'jumpRight',
      frames: [ { key: 'player', frame: 19}],
      frameRate: 20
    });

    try {
      this.room = await this.client.joinOrCreate('gameroom');
      console.log('Joined successfully! :)')
    } catch (err) {
      console.log(err);
    }

    this.room.state.players.onAdd = (player, sessionId) => {
      const entity = new Player(this, player.x, player.y);

      this.playerEntities[sessionId] = entity;

      //collision
      this.physics.add.collider(entity, floor);

      //if the player entity is the client player
      if (sessionId === this.room.sessionId) {
        this.currentPlayer = entity;
        this.cameras.main.startFollow(entity);

        player.listen('facing', () => {
          this.currentPlayer.facing = player.facing;
        })

      } else { //for all the other players
        player.listen("x", (newX) => {
          entity.setData('serverX', newX);
        })

        // player.listen('y', (newY) => {
        //   entity.setData('serverY', newY);
        // })

        player.listen('facing', (serverFacing) => {
          entity.setData('serverFacing', serverFacing);
        })
      }

      this.cameras.main.setBounds(0, 0, 2250, 1410);
      // this.cameras.main.setViewport(0, 0, 800, 600);
      // this.cameras.main.setZoom(1.15);
      // this.cameras.main.setSize(800, 600);

    }

    this.room.state.players.onRemove = (player, sessionId) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
      }

      delete this.playerEntities[sessionId];
    }
  }

  fixedTick(time: number, delta: number) {
    //if not connected yet, don't do any of this
    if (!this.room) {
      return;
    }

    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;

    //jump payload just on keydown
    let zKey = this.input.keyboard.addKey('z');
    zKey.on('down', e => {
        this.inputPayload.jump = true;
        this.currentPlayer.setVelocityY(-250);
    })

    // if (this.currentPlayer.body.touching.down) {
    //   this.inputPayload.jump = false;
    // }

    this.room.send(0, this.inputPayload);

    //for client player update movement instantly
    if (this.inputPayload.left) {
      this.currentPlayer.x -= MOVE_SPEED;
      this.currentPlayer.anims.play('moveLeft', true);
    } else if (this.inputPayload.right) {
      this.currentPlayer.x += MOVE_SPEED;
      this.currentPlayer.anims.play('moveRight', true);
    } else if (!this.inputPayload.right && !this.inputPayload.left) {
      switch(this.currentPlayer.facing) {
        case 'right':
          this.currentPlayer.anims.play('standRight');
          break;
        case 'left':
          this.currentPlayer.anims.play('standLeft');
          break;
      }
    }

    //linear interpolation to smooth player movement
    for (let sessionId in this.playerEntities) {

      //don't interpolate if player is client player
      if (sessionId === this.room.sessionId) {
        continue;
      }

      const entity = this.playerEntities[sessionId];
      const { serverX, serverFacing } = entity.data.values;

      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.8);
      if (Math.abs(serverX - entity.x) < 0.5) {
        switch(serverFacing) {
          case 'left':
            entity.anims.play('standLeft');
            break;
          case 'right':
            entity.anims.play('standRight');
            break;
        }
      } else {
        switch(serverFacing) {
          case 'left':
            entity.anims.play('moveLeft', true);
            break;
          case 'right':
            entity.anims.play('moveRight', true);
            break;
        }
      }
      // entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2);
    }
  }

  elapsedTime = 0;
  fixedTimeStep = 1000 / 60;

  update(time: number, delta: number): void {
    //ignore if not yet connected
    if (!this.currentPlayer) {
      return;
    }

    this.elapsedTime += delta;
    while (this.elapsedTime >= this.fixedTimeStep) {
      this.elapsedTime -= this.fixedTimeStep;
      this.fixedTick(time, this.fixedTimeStep);
    }
  }

}