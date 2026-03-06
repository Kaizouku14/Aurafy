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
  examDate: text("exam_date").notNull(), // ISO string "YYYY-MM-DD" — used to cap SM-2 intervals

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

  front: text("front").notNull(), // Question shown to user
  back: text("back").notNull(), // Correct answer for AI evaluation

  repetitions: integer("repetitions").notNull().default(0), // Times reviewed successfully
  easeFactor: real("ease_factor").notNull().default(2.5), // SM-2 EF, min 1.3
  interval: integer("interval").notNull().default(1), // Days until next review
  nextReviewAt: text("next_review_at"), // ISO string "YYYY-MM-DD"

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

  userAnswer: text("user_answer").notNull(), // What the user typed
  qualityScore: integer("quality_score").notNull(), // 0–5 from AI evaluation
  nextReviewAt: text("next_review_at").notNull(), // Resulting SM-2 schedule "YYYY-MM-DD"

  reviewedAt: integer("reviewed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
