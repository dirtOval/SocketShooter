import { Server } from "colyseus"
import { GameRoom } from './GameRoom';
const port = parseInt(process.env.PORT) || 3000

const gameServer = new Server()

gameServer.define('gameroom', GameRoom);

gameServer.listen(port)
console.log(`[GameServer] Listening on Port: ${port}`)
