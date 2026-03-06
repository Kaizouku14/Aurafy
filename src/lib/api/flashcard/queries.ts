import { db } from "@/server/db";
import { flashcardDecks, flashcards, flashcardReviews } from "@/server/db/schema/flashcard";
import { eq, and, sql, lte, isNull, or } from "drizzle-orm";

export async function createDeckRecord(deckId: string, userId: string, subject: string, examDate: string) {
  return db.insert(flashcardDecks).values({
    id: deckId,
    userId,
    subject,
    examDate,
  });
}

export async function createCardsBatch(cards: { id: string; deckId: string; front: string; back: string }[]) {
  return db.insert(flashcards).values(cards);
}

export async function getUserDecks(userId: string) {
  return db.query.flashcardDecks.findMany({
    where: eq(flashcardDecks.userId, userId),
    orderBy: (decks, { desc }) => [desc(decks.createdAt)],
  });
}

export async function getDeckCardCounts(userId: string, todayStr: string) {
  return db
    .select({
      deckId: flashcards.deckId,
      dueCount: sql<number>`sum(case when ${flashcards.nextReviewAt} <= ${todayStr} or ${flashcards.nextReviewAt} is null then 1 else 0 end)`.mapWith(Number),
      totalCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(eq(flashcardDecks.userId, userId))
    .groupBy(flashcards.deckId);
}

export async function getDeckByIdAndUser(deckId: string, userId: string) {
  return db.query.flashcardDecks.findFirst({
    where: and(
      eq(flashcardDecks.id, deckId),
      eq(flashcardDecks.userId, userId)
    )
  });
}

export async function getDueCardsByDeck(deckId: string, todayStr: string) {
  return db.query.flashcards.findMany({
    where: and(
      eq(flashcards.deckId, deckId),
      or(
        lte(flashcards.nextReviewAt, todayStr),
        isNull(flashcards.nextReviewAt)
      )
    ),
  });
}

export async function getCardById(cardId: string) {
  return db.query.flashcards.findFirst({
    where: eq(flashcards.id, cardId),
  });
}

export async function getDeckById(deckId: string) {
  return db.query.flashcardDecks.findFirst({
    where: eq(flashcardDecks.id, deckId)
  });
}

export async function updateCardSM2(
  cardId: string,
  repetitions: number,
  easeFactor: number,
  interval: number,
  nextReviewAt: string
) {
  return db.update(flashcards)
    .set({
       repetitions,
       easeFactor,
       interval,
       nextReviewAt
    })
    .where(eq(flashcards.id, cardId));
}

export async function createReviewRecord(
  reviewId: string,
  flashcardId: string,
  userId: string,
  userAnswer: string,
  qualityScore: number,
  nextReviewAt: string
) {
  return db.insert(flashcardReviews).values({
    id: reviewId,
    flashcardId,
    userId,
    userAnswer,
    qualityScore,
    nextReviewAt,
  });
}
