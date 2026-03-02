import { createTable } from "../schema";
import { integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { playlists } from "./playlist";
import { user } from "./user";

export const pomodoroSessions = createTable("pomodoro_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  playlistId: text("playlist_id").references(() => playlists.id, {
    onDelete: "set null",
  }),

  workDuration: integer("work_duration").notNull().default(25), // minutes
  breakDuration: integer("break_duration").notNull().default(5), // minutes
  completedCycles: integer("completed_cycles").notNull().default(0),

  startedAt: integer("started_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  endedAt: integer("ended_at", { mode: "timestamp" }),
});
