import Phaser from 'phaser';
import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/App';
import {GameView} from './components/Game';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <App />
    <GameView />
  </>
);