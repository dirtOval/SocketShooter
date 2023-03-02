import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import React from 'react';

export const GameView = ({activeRoomId, setAppState}) => {

  const [gameRunning, setGameRunning] = React.useState(true);
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

    const observer = new MutationObserver(mutations_list => {
      mutations_list.forEach(mutation => {
        mutation.removedNodes.forEach( removed_node => {
          // console.log(removed_node.nodeName);
          if (removed_node.nodeName === 'CANVAS') {
            console.log('game ended, returning to menu :)');
            setAppState('menu');
            observer.disconnect();
          }
        })
      })
    })
    observer.observe(document.querySelector('body'), {childList: true});
  }, [])

}