import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import React from 'react';
import ReactDOM from 'react-dom';

export const GameView = (props) => {
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
    scene: [ GameScene ],
  };

  const game = new Phaser.Game(config);
}