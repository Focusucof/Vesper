import { db } from "./db/drizzle";
import { messages, type Message, type NewMessage } from "./db/schema";
import { clients } from "./main";
import { type InitMessage, type JoinMessage, type MessageContent } from "./types/messages";

export async function saveMessage(msg: MessageContent, userId: string): Promise<Message | undefined> {
    const message: NewMessage = {
        roomId: msg.room,
        content: msg.content,
        userId: userId,
    };
    try {
        const entry = await db.insert(messages).values(message).returning();
        console.log(`Message saved: ${msg.content}`);
        return entry[0];
    } catch (error) {
        console.error("Error saving message:", error);
    }
}

export async function handleMessage(ws: Bun.ServerWebSocket<unknown>, data: string | Buffer<ArrayBufferLike>, server: Bun.Server) {
    let msg;
    try {
        msg = typeof data === "string" ? JSON.parse(data) : JSON.parse(Buffer.from(data).toString());
    } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
        return;
    }

    const client = clients.get(ws);
    if (!client) return;

    switch(msg.type) {
        case "init":
            messageInit(msg, client);
            break;
        case "join":
            messageJoin(msg, ws, client);
            break;
        case "message":
            messageContent(msg, client, server);
            break;
        default:
            ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
            return;
    }


    // if (msg.type === "init") {
    //     client.userId = msg.userId;
    //     console.log(`User ${msg.userId} connected`);
    // }

    // if (msg.type === "join") {
    //     client.rooms.add(msg.room);
    //     ws.subscribe(msg.room);
    //     console.log(`User ${client.userId} joined ${msg.room}`);
    //     // const messages = await getMessagesByRoom(msg.room);
    //     // ws.send(JSON.stringify({ type: "history", messages }));
    // }

    // if (msg.type === "message") {
        
    //     // await saveMessage(messageData);
    //     // Broadcast to all clients in the room using pub/sub
    //     server.publish(msg.room, JSON.stringify({
    //         from: client.userId,
    //         room: msg.room,
    //         content: msg.content,
    //     }));
    // }
}

function messageInit(msg: InitMessage, client: { userId: string | null, rooms: Set<string> }) {
    client.userId = msg.userId;
    console.log(`User ${msg.userId} connected`);
}

function messageJoin(msg: JoinMessage, ws: Bun.ServerWebSocket<unknown>, client: { userId: string | null, rooms: Set<string> }) {
    client.rooms.add(msg.room);
    ws.subscribe(msg.room);
    console.log(`User ${client.userId} joined ${msg.room}`);
    // const messages = await getMessagesByRoom(msg.room);
    // ws.send(JSON.stringify({ type: "history", messages }));
}

function messageContent(msg: MessageContent, client: { userId: string | null, rooms: Set<string> }, server: Bun.Server) {
    const userId = client.userId!;
    
    // Broadcast to all clients in the room using pub/sub
    server.publish(msg.room, JSON.stringify({
        from: userId,
        room: msg.room,
        content: msg.content,
        timestamp: new Date().toISOString(),
    }));
    saveMessage(msg, userId);
}