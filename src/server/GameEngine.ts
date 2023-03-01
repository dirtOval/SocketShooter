import Matter from 'matter-js';
import {Bodies} from 'matter-js';

export class GameEngine {
  engine = null;
  world = null;
  state = null

  players = {};

  contructor(state) {
    this.state = state;
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.init();
  }

  init() {
    Matter.Composite.add(this.world, [
      Bodies.rectangle()
    ])
  }
}