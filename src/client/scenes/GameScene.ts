import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import Player from '../entities/Player';
import Bullet from '../entities/Bullet';
import {client} from '../utility/Client';
import ScoreLabel from '../ui/ScoreLabel';

const backgroundImage = require('../../assets/background.png');
const floorImage = require('../../assets/floor.png');
const bulletImage = require('../../assets/playerBullet.png');
const playerSheet = require('../../assets/hero_stand_run.png');
const platformImage = require('../../assets/platform.png');
const explosionSheet = require('../../assets/explosion.png');

const MOVE_SPEED = 6;
const BULLET_SPEED = 600;

export class GameScene extends Phaser.Scene {

  currentPlayer: Player;
  remoteRef: Phaser.GameObjects.Rectangle;

  inputPayload = {
    left: false,
    right: false,
    jump: false,
    velocityY: 0,
    fire: false
  }


  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  preload() {
    this.load.image('background', backgroundImage);
    this.load.image('floor', floorImage);
    this.load.image('platform', platformImage);
    this.load.image('bullet', bulletImage);
    this.load.spritesheet('player', playerSheet,
                          {frameWidth: 50, frameHeight: 50, endFrame: 20});
    this.load.spritesheet('explosion', explosionSheet,
                          {frameWidth: 64, frameHeight: 64});

    this.cursorKeys = this.input.keyboard.createCursorKeys()



  }

  // client = new Client("ws://localhost:3000");
  room: Room;

  playerEntities: {[sessionId: string]: any} = {};
  playerBullets: {[sessionId: string]: any} = {};

  async create() {
    console.log('Joining game!');

    const background = this.add.image(0, 0, 'background').setOrigin(0);

    const floor = this.physics.add.staticSprite(0, 909, 'floor').setOrigin(0).refreshBody();

    const platforms = this.physics.add.staticGroup();

    this.scoreLabel = this.createScoreLabel(this.cameras.main.x + 16, this.cameras.main.y + 16, 0)

    // platforms.create(370, 634, 'platform');
    // platforms.create(1174, 634, 'platform');
    // platforms.create(1972, 634, 'platform');
    // platforms.create(772, 390, 'platform');
    // platforms.create(1572, 390, 'platform');
    // platforms.create(370, 634, 'platform');
    // platforms.create(370, 634, 'platform');
    platforms.create(772, 858, 'platform');
    platforms.create(1572, 858, 'platform');




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
      key: 'jumpLeft',
      frames: [ { key: 'player', frame: 19}],
      frameRate: 20
    });

    //explosion animation
    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 15}),
      frameRate: 20
    })

    if (this.sys.game.config.gameTitle) {
      try {
        this.room = await client.joinById(this.sys.game.config.gameTitle);
        console.log('Joined successfully! :)')
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        this.room = await client.create('gameroom');
        console.log('game room created!');
      } catch (err) {
        console.log(err);
      }
    }

    this.room.state.players.onAdd = (player, sessionId) => {
      const entity = new Player(this, player.x, player.y);

      this.playerEntities[sessionId] = entity;
      this.playerBullets[sessionId] = [];

      //collision
      this.physics.add.collider(entity, floor);
      this.physics.add.collider(entity, platforms);

      // for (let sessionId in this.playerBullets) {
      //   // if (sessionId === this.room.sessionId) {
      //   //   continue;
      //   // }
      //   console.log('sessionid');
      //   for (let bullet of this.playerBullets[sessionId]) {

      //   }

      // }

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

        player.listen('y', (newY) => {
          entity.setData('serverY', newY);
        })

        player.listen('facing', (serverFacing) => {
          entity.setData('serverFacing', serverFacing);
        })

        player.listen('jumping', (serverJumping => {
          entity.setData('serverJumping', serverJumping);
        }))

        player.listen('velocityY', newVelocityY => {
          entity.setData('newVelocityY', newVelocityY);
        })

        player.listen('bullets', bulletArray => {
          entity.setData('bulletArray', bulletArray);
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
      delete this.playerBullets[sessionId];
    }
  }

  createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#FFF' }
		const label = new ScoreLabel(this, x, y, score, style).setScrollFactor(0);

		this.add.existing(label)

		return label
	}

  die() {
    this.playerEntities[this.room.sessionId].canFire = false;
    this.playerEntities[this.room.sessionId].dying = true;

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    const style = {fontSize: '72px'};
    this.add.text(screenCenterX, screenCenterY, 'You are Dead', style).setOrigin(0.5);

    this.time.addEvent({ delay: 2000, callback: () => {
      this.sys.game.destroy(true);
      this.room.leave();
    }})
  }

  fixedTick(time: number, delta: number) {
    //if not connected yet, don't do any of this
    if (!this.room) {
      return;
    }

    if (this.playerEntities[this.room.sessionId].active === false &&
        this.playerEntities[this.room.sessionId].dying === false) {
      this.die();
    }

    // console.log(this.playerBullets);

    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;

    if (this.currentPlayer.body) {
      this.inputPayload.velocityY = this.currentPlayer.body.velocity.y
    }

    //jump payload just on keydown
    let zKey = this.input.keyboard.addKey('z');
    zKey.on('down', e => {
      if (this.currentPlayer.body.touching.down) {
        this.inputPayload.velocityY = -300;
        this.inputPayload.jump = true;
        this.currentPlayer.setVelocityY(-300);
      }
    })

    if (this.currentPlayer.body) {
      if (this.currentPlayer.body.touching.down) {
        this.inputPayload.jump = false;
      }
    }

    let xKey = this.input.keyboard.addKey('x');
    if (xKey.isDown && this.currentPlayer.canFire) {
      const bullet = new Bullet(this, this.currentPlayer.x, this.currentPlayer.y - 10);
      if (this.currentPlayer.facing === 'left') {
        bullet.x = this.currentPlayer.x - 40;
        bullet.setVelocityX(-BULLET_SPEED);
      } else {
        bullet.x = this.currentPlayer.x + 40;
        bullet.setVelocityX(BULLET_SPEED);
      }
      this.playerBullets[this.room.sessionId].push(bullet)
      for (let player in this.playerEntities) {
        if (player === this.room.sessionId) {
          continue;
        }
        this.physics.add.collider(this.playerEntities[player], bullet, (entity, bullet) => {
          console.log('collided');
          bullet.destroy();
          entity.setActive(false).setVisible(false);
          const explosion = this.physics.add.sprite(entity.x, entity.y, 'explosion');
          explosion.setScale(2);
          explosion.play('explosion');
          explosion.on('animationcomplete', function() {
            explosion.destroy();
          })
          this.scoreLabel.add(100);
      })
      }

      this.inputPayload.fire = true;
      this.currentPlayer.canFire = false;
    }

    xKey.on('up', e => {
      this.currentPlayer.canFire = true;
      this.inputPayload.fire = false;
    })



    if (this.currentPlayer.body.touching.down) {
      this.inputPayload.jump = false;
    }

    this.room.send(0, this.inputPayload);

    //for client player update movement instantly
    if (Math.abs(this.currentPlayer.body.velocity.y) > 0) {
      switch(this.currentPlayer.facing) {
        case 'left':
          this.currentPlayer.anims.play('jumpLeft');
          break;
        case 'right':
          this.currentPlayer.anims.play('jumpRight');
          break;
      }
    }

    if (this.inputPayload.left) {
      this.currentPlayer.x -= MOVE_SPEED;
      if (Math.abs(this.currentPlayer.body.velocity.y) > 0) {
        this.currentPlayer.anims.play('jumpLeft');
      } else {
        this.currentPlayer.anims.play('moveLeft', true);
      }
      this.currentPlayer.facing = 'left';
    } else if (this.inputPayload.right) {
      this.currentPlayer.x += MOVE_SPEED;
      if (Math.abs(this.currentPlayer.body.velocity.y) > 0) {
        this.currentPlayer.anims.play('jumpRight');
      } else {
        this.currentPlayer.anims.play('moveRight', true);
      }
      this.currentPlayer.facing = 'right';
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

    // if (this.inputPayload.fire) {
    //   console.log('pew pew');
    //   const bullet = new Bullet(this, this.currentPlayer.x, this.currentPlayer.y - 10);
    //   if (this.currentPlayer.facing === 'left') {
    //     bullet.x = this.currentPlayer.x - 35;
    //     bullet.setVelocityX(-BULLET_SPEED);
    //   } else {
    //     bullet.x = this.currentPlayer.x + 35;
    //     bullet.setVelocityX(BULLET_SPEED);
    //   }
    //   this.playerBullets[this.room.sessionId].push()
    // }

    //linear interpolation to smooth player movement
    for (let sessionId in this.playerEntities) {

      //don't interpolate if player is client player
      if (sessionId === this.room.sessionId) {
        continue;
      }

      const entity = this.playerEntities[sessionId];
      const { serverX, serverFacing, newVelocityY, serverJumping, bulletArray } = entity.data.values;

      entity.x = Phaser.Math.Linear(entity.x, serverX, 0.8);
      entity.setVelocityY(newVelocityY);

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
              if (serverJumping) {
                entity.anims.play('jumpLeft');
              } else {
                entity.anims.play('moveLeft', true);
              }
              break;
            case 'right':
              if (serverJumping) {
                entity.anims.play('jumpRight');
              } else {
                entity.anims.play('moveRight', true);
              }
              break;
          }
        }

        //time to handle bullets
        if (this.playerBullets[sessionId].length < bulletArray.length) {
          while (this.playerBullets[sessionId].length < bulletArray.length) {
            const bullet = new Bullet(this, entity.x, entity.y - 10);
            this.playerBullets[sessionId].push(bullet);
            for (let player in this.playerEntities) {
              let collider = this.physics.add.collider(this.playerEntities[player], bullet, (entity, bullet) => {
                console.log('collided');
                bullet.destroy();
                entity.setActive(false).setVisible(false);
                const explosion = this.physics.add.sprite(entity.x, entity.y, 'explosion');
                explosion.setScale(2);
                explosion.play('explosion');
                explosion.on('animationcomplete', function() {
                  explosion.destroy();
                })
            })
            }

            if (serverFacing === 'left') {
              bullet.x = entity.x - 35;
              bullet.setVelocityX(-BULLET_SPEED);
            } else {
              bullet.x = entity.x + 35;
              bullet.setVelocityX(BULLET_SPEED);
            }
          }
        }


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