import { relations } from "drizzle-orm";
import { flashcardDecks, flashcardReviews, flashcards } from "./flashcard";
import { user, account, session } from "./user";
import { chat } from "./chat";
import { studyPlans } from "./planner";
import { cornellNotes } from "./note";
import { quizAttemptAnswers, quizAttempts, quizQuestions, quizSets } from "./quiz";

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  flashcardDecks: many(flashcardDecks),
  flashcardReviews: many(flashcardReviews),
  chats: many(chat),
  studyPlans: many(studyPlans),
  cornellNotes: many(cornellNotes),
  quizSets: many(quizSets),
  quizAttempts: many(quizAttempts),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const flashcardDecksRelations = relations(
  flashcardDecks,
  ({ one, many }) => ({
    user: one(user, {
      fields: [flashcardDecks.userId],
      references: [user.id],
    }),
    flashcards: many(flashcards),
  }),
);

export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  deck: one(flashcardDecks, {
    fields: [flashcards.deckId],
    references: [flashcardDecks.id],
  }),
  reviews: many(flashcardReviews),
}));

export const flashcardReviewsRelations = relations(
  flashcardReviews,
  ({ one }) => ({
    flashcard: one(flashcards, {
      fields: [flashcardReviews.flashcardId],
      references: [flashcards.id],
    }),
    user: one(user, {
      fields: [flashcardReviews.userId],
      references: [user.id],
    }),
  }),
);

export const chatRelations = relations(chat, ({ one }) => ({
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
}));

export const studyPlansRelations = relations(studyPlans, ({ one }) => ({
  user: one(user, {
    fields: [studyPlans.userId],
    references: [user.id],
  }),
}));

export const cornellNotesRelations = relations(cornellNotes, ({ one }) => ({
  user: one(user, {
    fields: [cornellNotes.userId],
    references: [user.id],
  }),
}));

export const quizSetsRelations = relations(quizSets, ({ one, many }) => ({
  user: one(user, {
    fields: [quizSets.userId],
    references: [user.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quizSet: one(quizSets, {
    fields: [quizQuestions.quizSetId],
    references: [quizSets.id],
  }),
  answers: many(quizAttemptAnswers),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  quizSet: one(quizSets, {
    fields: [quizAttempts.quizSetId],
    references: [quizSets.id],
  }),
  user: one(user, {
    fields: [quizAttempts.userId],
    references: [user.id],
  }),
  answers: many(quizAttemptAnswers),
}));

export const quizAttemptAnswersRelations = relations(
  quizAttemptAnswers,
  ({ one }) => ({
    attempt: one(quizAttempts, {
      fields: [quizAttemptAnswers.attemptId],
      references: [quizAttempts.id],
    }),
    question: one(quizQuestions, {
      fields: [quizAttemptAnswers.questionId],
      references: [quizQuestions.id],
    }),
  }),
);
