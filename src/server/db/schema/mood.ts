import { integer, real, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../schema";
import { sql } from "drizzle-orm";
import { user } from "./user";

export const moodSessions = createTable("mood_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Full chat history stored as JSON string: [{ role, content }]
  messages: text("messages", { mode: "json" })
    .notNull()
    .default(sql`'[]'`),

  // Detected mood output from Grok
  mood: text("mood"), // e.g. "calm", "happy", "stressed"
  energy: real("energy"), // 0.0 – 1.0
  valence: real("valence"), // 0.0 – 1.0
  confidence: real("confidence"), // 0.0 – 1.0

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
