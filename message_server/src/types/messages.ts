export type MessageType = "init" | "join" | "message";
export interface InitMessage {
    type: "init";
    userId: string;
}
export interface JoinMessage {
    type: "join";
    room: string;
}
export interface MessageContent {
    type: "message";
    room: string;
    content: string;
}