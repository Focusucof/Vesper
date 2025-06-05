import Bun from "bun";
import 'dotenv/config';

const clients = new Map<Bun.ServerWebSocket<unknown>, { userId: string | null, rooms: Set<string> }>();

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
        async message(ws, data) {
            let msg;
            try {
                msg = typeof data === "string" ? JSON.parse(data) : JSON.parse(Buffer.from(data).toString());
            } catch {
                ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
                return;
            }
            const client = clients.get(ws);
            if (!client) return;

            if (msg.type === "init") {
                client.userId = msg.userId;
                console.log(`User ${msg.userId} connected`);
            }

            if (msg.type === "join") {
                client.rooms.add(msg.room);
                ws.subscribe(msg.room);
                console.log(`User ${client.userId} joined ${msg.room}`);
                // const messages = await getMessagesByRoom(msg.room);
                // ws.send(JSON.stringify({ type: "history", messages }));
            }

            if (msg.type === "message") {
                const messageData = {
                    content: msg.content,
                    userId: client.userId,
                    room: msg.room,
                };
                // await saveMessage(messageData);
                // Broadcast to all clients in the room using pub/sub
                server.publish(msg.room, JSON.stringify({
                    from: client.userId,
                    room: msg.room,
                    content: msg.content,
                }));
            }
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