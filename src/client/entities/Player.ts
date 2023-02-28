import Phaser from 'phaser';

class Player extends Phaser.Physics.Arcade.Sprite {

  constructor (scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5);
    this.setCollideWorldBounds(true);
  }
}

export default Player