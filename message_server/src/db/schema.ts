import { pgTable, varchar, uuid, timestamp, text } from "drizzle-orm/pg-core";



export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom(),
  roomId: varchar("room_id", { length: 255 }).notNull(),
  // serverId: uuid("server_id").notNull(),
  userId: text("user_id").notNull(),
  content: varchar("content", { length: 1000 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;