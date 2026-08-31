import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { generateCardsFromNotes, evaluateUserAnswer } from "@/lib/ai/flashcard-ai";
import { calculateSM2 } from "@/lib/study/sm2";
import { TRPCError } from "@trpc/server";
import { assessStudyContent, validateManualCard } from "@/lib/study/content-validation";
import { CardDraftSchema } from "@/types/schema/flashcard";
import {
  createDeckWithCards,
  getUserDecks,
  getDeckCardCounts,
  getDeckByIdAndUser,
  getDueCardsByDeck,
  getCardById,
  getDeckById,
  getDeckCardsByDeck,
  createSingleCard,
  updateCardContent,
  deleteCardById,
  updateCardSM2,
  createReviewRecord,
  deleteDeckById
} from "@/lib/api/flashcard/queries";

export const flashcardRouter = createTRPCRouter({
  generateCards: protectedProcedure
    .input(
      z.object({
        notes: z.string().min(10, "Notes are too short").max(10000, "Notes are too long (max 10,000 chars)"),
      })
    )
    .mutation(async ({ input }) => {
      const assessment = await assessStudyContent(input.notes);

      if (!assessment.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: assessment.message });
      }

      const generatedCards = await generateCardsFromNotes(assessment.normalized);

      if (!generatedCards || generatedCards.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate any cards from the provided notes.",
        });
      }

      return generatedCards;
    }),

  createDeck: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1, "Subject is required").max(100),
        examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        cards: z
          .array(
            z.object({
              front: z.string().trim().min(1, "Card prompt is required").max(2000),
              back: z.string().trim().min(1, "Card answer is required").max(5000),
            })
          )
          .min(1, "Add at least one card")
          .max(20, "Maximum of 20 cards"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deckId = nanoid();
      await createDeckWithCards(
        deckId,
        ctx.session.user.id,
        input.subject,
        input.examDate,
        input.cards.map((card) => ({
          id: nanoid(),
          front: card.front,
          back: card.back,
        }))
      );

      return { deckId, cardCount: input.cards.length };
    }),

  getDecks: protectedProcedure.query(async ({ ctx }) => {
    const decks = await getUserDecks(ctx.session.user.id);

    if (decks.length === 0) return [];

    const todayStr = new Date().toISOString().split("T")[0]!;

    const counts = await getDeckCardCounts(ctx.session.user.id, todayStr);
    const countMap = new Map(counts.map((c) => [c.deckId, { due: c.dueCount, total: c.totalCount }]));

    return decks.map((deck) => ({
      ...deck,
      dueCardsCount: countMap.get(deck.id)?.due ?? 0,
      totalCardsCount: countMap.get(deck.id)?.total ?? 0,
    }));
  }),

  getDueCards: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      const deck = await getDeckByIdAndUser(input.deckId, ctx.session.user.id);

      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      const todayStr = new Date().toISOString().split("T")[0]!;
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
      
      if (deck?.userId !== ctx.session.user.id) {
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

  getDeckCards: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      const deck = await getDeckByIdAndUser(input.deckId, ctx.session.user.id);

      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      const cards = await getDeckCardsByDeck(input.deckId);
      return { deck, cards };
    }),

  createCard: protectedProcedure
    .input(z.object({ deckId: z.string() }).merge(CardDraftSchema))
    .mutation(async ({ ctx, input }) => {
      const deck = await getDeckByIdAndUser(input.deckId, ctx.session.user.id);

      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      const validated = validateManualCard(input.front, input.back);
      if (!validated.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: validated.message });
      }

      const cardId = nanoid();
      await createSingleCard(cardId, input.deckId, validated.front, validated.back);
      return { id: cardId, deckId: input.deckId, front: validated.front, back: validated.back };
    }),

  updateCard: protectedProcedure
    .input(z.object({ flashcardId: z.string() }).merge(CardDraftSchema))
    .mutation(async ({ ctx, input }) => {
      const card = await getCardById(input.flashcardId);

      if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });

      const deck = await getDeckById(card.deckId);
      if (deck?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const validated = validateManualCard(input.front, input.back);
      if (!validated.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: validated.message });
      }

      await updateCardContent(input.flashcardId, validated.front, validated.back);
      return { id: input.flashcardId, deckId: card.deckId, front: validated.front, back: validated.back };
    }),

  deleteCard: protectedProcedure
    .input(z.object({ flashcardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const card = await getCardById(input.flashcardId);

      if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });

      const deck = await getDeckById(card.deckId);
      if (deck?.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await deleteCardById(input.flashcardId);
      return { success: true };
    }),

  deleteDeck: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deck = await getDeckByIdAndUser(input.deckId, ctx.session.user.id);

      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      await deleteDeckById(input.deckId);
      return { success: true };
    }),
});
