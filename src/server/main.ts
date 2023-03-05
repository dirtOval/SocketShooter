import { Server } from "colyseus"
import { GameRoom } from './GameRoom';
import {createServer} from 'http';
import express from 'express';
const path = require('path');
const app = express();
const port = parseInt(process.env.PORT) || 3000

const gameServer = new Server({
  server: createServer(app)
});
app.use(express.static('dist'));
app.use(express.json());

gameServer.define('gameroom', GameRoom);

gameServer.listen(port)
console.log(`[GameServer] Listening on Port: ${port}`)
