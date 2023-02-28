import http from "http";
import { Room, Client } from "colyseus";

export class GameRoom extends Room {
    // When room is initialized
    onCreate (options: any) { }

    // When client successfully join the room
    onJoin (client: Client, options: any, auth: any) {
        console.log(client.id, 'has joined!');
     }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) { }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}