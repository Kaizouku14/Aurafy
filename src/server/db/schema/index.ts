import { user, account, session, verification } from "./user";
import { flashcardDecks, flashcards, flashcardReviews } from "./flashcard";
import { chat } from "./chat";
import { studyPlans } from "./planner";
import { cornellNotes } from "./note";
import { quizAttemptAnswers, quizAttempts, quizQuestions, quizSets } from "./quiz";

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
  quizSets,
  quizQuestions,
  quizAttempts,
  quizAttemptAnswers,
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
  quizSetsRelations,
  quizQuestionsRelations,
  quizAttemptsRelations,
  quizAttemptAnswersRelations,
} from "./relations";
