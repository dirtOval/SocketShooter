import Phaser from 'phaser';

class Bullet extends Phaser.Physics.Arcade.Sprite {

  constructor (scene, x, y) {
    super(scene, x, y, 'bullet');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5)
    // this.setVelocityX(-30);
    this.body.allowGravity = false;
    this.setCollideWorldBounds(true);

    this.body.onWorldBounds = true;

    this.body.world.on('worldbounds', body => {
      if (body.gameObject === this) {
        this.destroy();
      }
    });
  }

  speed = 400;
}

export default Bullet