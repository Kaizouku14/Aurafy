import { relations } from "drizzle-orm";
import { flashcardDecks, flashcardReviews, flashcards } from "./flashcard";
import { user, account, session } from "./user";

// User Table
export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  flashcardDecks: many(flashcardDecks),
  flashcardReviews: many(flashcardReviews),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Flashcard Decks Table
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

// Flashcards Table
export const flashcardsRelations = relations(flashcards, ({ one, many }) => ({
  deck: one(flashcardDecks, {
    fields: [flashcards.deckId],
    references: [flashcardDecks.id],
  }),
  reviews: many(flashcardReviews),
}));

// Flashcard Reviews Table
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
