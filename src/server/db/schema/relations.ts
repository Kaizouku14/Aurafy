import { relations } from "drizzle-orm";
import { flashcardDecks, flashcardReviews, flashcards } from "./flashcard";
import { moodSessions } from "./mood";
import { playlists } from "./playlist";
import { pomodoroSessions } from "./pomodoro";
import { user, account, session } from "./user";

// User Table
export const userRelations = relations(user, ({ many }) => ({
  account: many(account),
  session: many(session),
  moodSessions: many(moodSessions),
  playlists: many(playlists),
  pomodoroSessions: many(pomodoroSessions),
  flashcardDecks: many(flashcardDecks),
  flashcardReviews: many(flashcardReviews),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

// Mood Sessions Table
export const moodSessionsRelations = relations(
  moodSessions,
  ({ one, many }) => ({
    user: one(user, { fields: [moodSessions.userId], references: [user.id] }),
    playlists: many(playlists),
  }),
);

// Playlists Table
export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(user, { fields: [playlists.userId], references: [user.id] }),
  moodSession: one(moodSessions, {
    fields: [playlists.moodSessionId],
    references: [moodSessions.id],
  }),
  pomodoroSessions: many(pomodoroSessions),
}));

// Pomodoro Sessions Table
export const pomodoroSessionsRelations = relations(
  pomodoroSessions,
  ({ one }) => ({
    user: one(user, {
      fields: [pomodoroSessions.userId],
      references: [user.id],
    }),
    playlist: one(playlists, {
      fields: [pomodoroSessions.playlistId],
      references: [playlists.id],
    }),
  }),
);

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
