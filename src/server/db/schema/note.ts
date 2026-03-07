import { integer, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../create-table";
import { sql } from "drizzle-orm";
import { user } from "./user";

export const cornellNotes = createTable("cornell_notes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  subject: text("subject").notNull(),
  cues: text("cues").notNull().default(""),
  notes: text("notes").notNull().default(""),
  summary: text("summary").notNull().default(""),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
