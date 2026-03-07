import { relations } from "drizzle-orm";
import { flashcardDecks, flashcardReviews, flashcards } from "./flashcard";
import { user, account, session } from "./user";
import { chat } from "./chat";
import { studyPlans } from "./planner";
import { cornellNotes } from "./note";

export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  flashcardDecks: many(flashcardDecks),
  flashcardReviews: many(flashcardReviews),
  chats: many(chat),
  studyPlans: many(studyPlans),
  cornellNotes: many(cornellNotes),
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
