import { user, account, session, verification } from "./user";
import { flashcardDecks, flashcards, flashcardReviews } from "./flashcard";
import { chat } from "./chat";
import { studyPlans } from "./planner";
import { cornellNotes } from "./note";

export {
  user,
  account,
  session,
  verification,
  flashcardDecks,
  flashcards,
  flashcardReviews,
  chat,
  studyPlans,
  cornellNotes,
};

export {
  userRelations,
  accountRelations,
  sessionRelations,
  flashcardDecksRelations,
  flashcardsRelations,
  flashcardReviewsRelations,
  chatRelations,
  studyPlansRelations,
  cornellNotesRelations,
} from "./relations";
