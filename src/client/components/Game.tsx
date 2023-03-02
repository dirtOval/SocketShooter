import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import React from 'react';

export const GameView = ({activeRoomId}) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 300 }
      }
    },
    pixelArt: true,
    title: activeRoomId,
    scene: [ GameScene ],
  };

  React.useEffect(() => {
    const game = new Phaser.Game(config);
  }, [])

}