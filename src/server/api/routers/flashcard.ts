import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { generateCardsFromNotes, evaluateUserAnswer } from "@/lib/ai/flashcard-ai";
import { calculateSM2 } from "@/lib/study/sm2";
import { TRPCError } from "@trpc/server";
import { 
  createDeckRecord, 
  createCardsBatch, 
  getUserDecks, 
  getDeckCardCounts, 
  getDeckByIdAndUser, 
  getDueCardsByDeck, 
  getCardById, 
  getDeckById, 
  updateCardSM2, 
  createReviewRecord 
} from "@/lib/api/flashcard/queries";

export const flashcardRouter = createTRPCRouter({
  createDeck: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1, "Subject is required").max(100),
        examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        notes: z.string().min(10, "Notes are too short").max(10000, "Notes are too long (max 10,000 chars)"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const generatedCards = await generateCardsFromNotes(input.notes);
      
      if (!generatedCards || generatedCards.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate any cards from the provided notes.",
        });
      }

      const deckId = nanoid();
      await createDeckRecord(deckId, ctx.session.user.id, input.subject, input.examDate);

      const cardsToInsert = generatedCards.map((card: { front: string; back: string }) => ({
        id: nanoid(),
        deckId,
        front: card.front,
        back: card.back,
      }));

      await createCardsBatch(cardsToInsert);

      return { deckId, cardCount: cardsToInsert.length };
    }),

  getDecks: protectedProcedure.query(async ({ ctx }) => {
    const decks = await getUserDecks(ctx.session.user.id);

    if (decks.length === 0) return [];

    const todayStr = new Date().toISOString().split("T")[0] as string;

    const counts = await getDeckCardCounts(ctx.session.user.id, todayStr);
    const countMap = new Map(counts.map((c) => [c.deckId, { due: c.dueCount, total: c.totalCount }]));

    return decks.map((deck) => ({
      ...deck,
      dueCardsCount: countMap.get(deck.id)?.due || 0,
      totalCardsCount: countMap.get(deck.id)?.total || 0,
    }));
  }),

  getDueCards: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      const deck = await getDeckByIdAndUser(input.deckId, ctx.session.user.id);

      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      const todayStr = new Date().toISOString().split("T")[0] as string;
      const dueCards = await getDueCardsByDeck(input.deckId, todayStr);

      return dueCards;
    }),

  submitReview: protectedProcedure
    .input(
      z.object({
        flashcardId: z.string(),
        userAnswer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const card = await getCardById(input.flashcardId);

      if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      
      const deck = await getDeckById(card.deckId);
      
      if (!deck || deck.userId !== ctx.session.user.id) {
         throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const evaluation = await evaluateUserAnswer(card.front, card.back, input.userAnswer);

      const sm2Result = calculateSM2(
        evaluation.score,
        card.repetitions,
        card.easeFactor,
        card.interval,
        deck.examDate
      );

      await updateCardSM2(
        card.id, 
        sm2Result.repetitions, 
        sm2Result.easeFactor, 
        sm2Result.interval, 
        sm2Result.nextReviewAt
      );

      await createReviewRecord(
        nanoid(),
        card.id,
        ctx.session.user.id,
        input.userAnswer,
        evaluation.score,
        sm2Result.nextReviewAt
      );

      return {
        score: evaluation.score,
        feedback: evaluation.feedback,
        back: card.back
      };
    }),
});
