import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { flashcardRouter } from "./routers/flashcard";

export const appRouter = createTRPCRouter({
  flashcard: flashcardRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
