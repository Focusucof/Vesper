import { pgTable, varchar, uuid, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";


export const messages = pgTable("messages", {
  id: uuid("id").default(randomUUID()).primaryKey().notNull(),
  roomId: varchar("room_id", { length: 255 }).notNull(),
  serverId: uuid("server_id").notNull(),
  userId: uuid("user_id").notNull(),
  content: varchar("content", { length: 1000 }).notNull(),
  timestamp: timestamp("timestamp")
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;