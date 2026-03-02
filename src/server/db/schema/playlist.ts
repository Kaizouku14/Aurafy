import { integer, real, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../schema";
import { sql } from "drizzle-orm";
import { moodSessions } from "./mood";
import { user } from "./user";

export const playlists = createTable("playlists", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  moodSessionId: text("mood_session_id").references(() => moodSessions.id, {
    onDelete: "set null",
  }),

  spotifyPlaylistId: text("spotify_playlist_id").notNull(),
  spotifyPlaylistUrl: text("spotify_playlist_url").notNull(),
  name: text("name").notNull(),

  // Snapshot of mood at generation time
  mood: text("mood"),
  energy: real("energy"),
  valence: real("valence"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
