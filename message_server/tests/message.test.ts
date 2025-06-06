import { afterAll, expect, test } from "bun:test";

test("WebSocket message exchange", async () => {
    await new Promise<void>((resolve, reject) => {
        const socket1 = new WebSocket("ws://localhost:3000");
        const socket2 = new WebSocket("ws://localhost:3000");

        socket1.onopen = () => {
            // console.log("Socket 1 connected");
            socket1.send(JSON.stringify({ type: "init", userId: "test1" }));
            socket1.send(JSON.stringify({ type: "join", room: "room1" }));
            setTimeout(() => {
                socket1.send(JSON.stringify({ type: "message", room: "room1", content: "Hello from socket 1" }));
            }, 100);
        };

        socket2.onopen = () => {
            // console.log("Socket 2 connected");
            socket2.send(JSON.stringify({ type: "init", userId: "test2" }));
            socket2.send(JSON.stringify({ type: "join", room: "room1" }));
        };

        socket2.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("Socket 2 received:", message);


            expect(message.from).toBe("test1");
            expect(message.room).toBe("room1");
            expect(message.content).toBe("Hello from socket 1");
            expect(message.timestamp).toBeDefined();

            socket1.close();
            socket2.close();
            resolve(); // End the test here
        };

        setTimeout(() => reject(new Error("Test timed out")), 2000);
    });
});