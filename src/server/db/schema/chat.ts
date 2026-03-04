import { index, integer, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../create-table";
import { user } from "./user";
import { ROLE } from "@/constants/role";
import { sql } from "drizzle-orm";

export const chat = createTable(
  "chat",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ROLE }).notNull(),
    content: text("content").notNull(),
    metadata: text("metadata"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("chat_created_at_idx").on(table.createdAt),
    index("chat_user_id_idx").on(table.userId),
  ],
);
