import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { flashcardRouter } from "./routers/flashcard";
import { plannerRouter } from "./routers/planner";
import { notesRouter } from "./routers/notes";

export const appRouter = createTRPCRouter({
  flashcard: flashcardRouter,
  planner: plannerRouter,
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
