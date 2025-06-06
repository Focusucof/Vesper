import Bun from "bun";
import { handleMessage } from "./messageHandler";

export const clients = new Map<Bun.ServerWebSocket<unknown>, { userId: string | null, rooms: Set<string> }>();

const server = Bun.serve({
    fetch(req, server) {
        if (server.upgrade(req)) return;
        return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        open(ws) {
            clients.set(ws, { userId: null, rooms: new Set() });
            console.log("New client connected");
        },
        message(ws, data) {
            handleMessage(ws, data, server);
        },
        close(ws) {
            clients.delete(ws);
            // Optionally, unsubscribe from all rooms
            // for (const room of client.rooms) ws.unsubscribe(room);
            console.log("Client disconnected");
        },
    },
});

console.log(`Listening on ${server.hostname}:${server.port}`);