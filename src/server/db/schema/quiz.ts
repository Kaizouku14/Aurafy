import { integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createTable } from "../create-table";
import { user } from "./user";

export const quizSets = createTable("quiz_sets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  subject: text("subject").notNull(),
  quizType: text("quiz_type").notNull(),
  sourceType: text("source_type").notNull().default("pdf"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const quizQuestions = createTable("quiz_questions", {
  id: text("id").primaryKey(),
  quizSetId: text("quiz_set_id")
    .notNull()
    .references(() => quizSets.id, { onDelete: "cascade" }),

  prompt: text("prompt").notNull(),
  optionsJson: text("options_json"),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const quizAttempts = createTable("quiz_attempts", {
  id: text("id").primaryKey(),
  quizSetId: text("quiz_set_id")
    .notNull()
    .references(() => quizSets.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const quizAttemptAnswers = createTable("quiz_attempt_answers", {
  id: text("id").primaryKey(),
  attemptId: text("attempt_id")
    .notNull()
    .references(() => quizAttempts.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "cascade" }),

  userAnswer: text("user_answer").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
