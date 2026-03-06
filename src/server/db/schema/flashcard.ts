import { integer, real, text } from "drizzle-orm/sqlite-core";
import { createTable } from "../create-table";
import { sql } from "drizzle-orm";
import { user } from "./user";

export const flashcardDecks = createTable("flashcard_decks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  subject: text("subject").notNull(),
  examDate: text("exam_date").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const flashcards = createTable("flashcards", {
  id: text("id").primaryKey(),
  deckId: text("deck_id")
    .notNull()
    .references(() => flashcardDecks.id, { onDelete: "cascade" }),

  front: text("front").notNull(),
  back: text("back").notNull(),

  repetitions: integer("repetitions").notNull().default(0),
  easeFactor: real("ease_factor").notNull().default(2.5),
  interval: integer("interval").notNull().default(1),
  nextReviewAt: text("next_review_at"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const flashcardReviews = createTable("flashcard_reviews", {
  id: text("id").primaryKey(),
  flashcardId: text("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  userAnswer: text("user_answer").notNull(),
  qualityScore: integer("quality_score").notNull(),
  nextReviewAt: text("next_review_at").notNull(),

  reviewedAt: integer("reviewed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
