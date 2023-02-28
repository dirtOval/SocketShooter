import http from "http";
import { Room, Client } from "colyseus";
import { Player, GameRoomState } from './GameRoomState';

//game constants
const MOVE_SPEED = 6;

export class GameRoom extends Room<GameRoomState> {
    // When room is initialized
    onCreate (options: any) {
        this.setState(new GameRoomState());

        //player input
        this.onMessage(0, (client, data) => {
            const player = this.state.players.get(client.sessionId);

            //movement
            if (data.left) {
                player.x -= MOVE_SPEED;
                console.log('moving left!');
            } else if (data.right) {
                player.x += MOVE_SPEED;
                console.log('moving right!');
            }
        })
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        console.log(client.sessionId, 'has joined!');

        const player = new Player();

        player.x = 400;
        player.y = 300;

        //assigns player to state
        this.state.players.set(client.sessionId, player);

     }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) {
        console.log(client.sessionId, 'left!');

        this.state.players.delete(client.sessionId);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}