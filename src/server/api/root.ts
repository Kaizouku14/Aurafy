import { createTRPCRouter } from "@/server/api/trpc";
import { flashcardRouter } from "./routers/flashcard";
import { plannerRouter } from "./routers/planner";
import { notesRouter } from "./routers/notes";
import { quizRouter } from "./routers/quiz";

export const appRouter = createTRPCRouter({
  flashcard: flashcardRouter,
  planner: plannerRouter,
  notes: notesRouter,
  quiz: quizRouter,
});

export type AppRouter = typeof appRouter;
