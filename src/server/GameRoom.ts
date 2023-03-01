import http from "http";
import { Room, Client } from "colyseus";
import { Player, GameRoomState } from './GameRoomState';

//game constants
const MOVE_SPEED = 6;
const fixedTimeStep = 1000 / 60;

export class GameRoom extends Room<GameRoomState> {


    // When room is initialized
    onCreate (options: any) {
        this.setState(new GameRoomState());

        //fixed tick-rate stuff.
        let elapsedTime = 0;

        this.setSimulationInterval(deltaTime => {
            elapsedTime += deltaTime;

            while (elapsedTime >= fixedTimeStep) {
              elapsedTime -= fixedTimeStep;
              this.update(fixedTimeStep);
            }
        })

        //player input
        this.onMessage(0, (client, data) => {
            const player = this.state.players.get(client.sessionId);

            player.inputQueue.push(data);
            // //movement
            // if (data.left) {
            //     player.x -= MOVE_SPEED;
            // } else if (data.right) {
            //     player.x += MOVE_SPEED;
            // }
        })

        this.setSimulationInterval((deltaTime) => {
            this.update(deltaTime);
        })
    }

    update(deltaTime: number) {

        this.state.players.forEach(player => {
            let input: any;

            while (input = player.inputQueue.shift()) {
                if (input.left) {
                    player.x -= MOVE_SPEED;
                    player.facing = 'left';
                } else if (input.right) {
                    player.x += MOVE_SPEED;
                    player.facing = 'right';
                }
            }
        })
    }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        console.log(client.sessionId, 'has joined!');

        const player = new Player();

        player.x = 400;
        player.y = 300;
        player.facing = 'right';

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