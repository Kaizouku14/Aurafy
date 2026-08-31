import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { MODELS } from "./models";
import { GENERATE_CARDS_PROMPT, EVALUATE_ANSWER_PROMPT } from "./prompt";
import { dedupeByNormalized } from "@/lib/study/content-validation";

const URL_ONLY = /^(?:https?:\/\/|www\.)/i;
const METADATA_FRONT =
  /^(?:page\s*\d+|\d+\s*of\s*\d+|chapter\s*\d+|section\s*\d+|\d+(?:\.\d+){1,3}\s*|references|bibliograph(?:y|ies)|toc|table\s+of\s+contents|appendix|acknowledg(?:e|emen)ments?|introduction|conclusion|index|glossary|table\s+\d+|figure\s+\d+)$/i;

export type DraftCard = { front: string; back: string };

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

export function sanitizeGeneratedCards<T extends { front: string; back: string }>(
  cards: T[],
): T[] {
  const cleaned = cards.map((card) => ({
    ...card,
    front: clean(card.front),
    back: clean(card.back),
  }));

  const meaningful = cleaned.filter((card) => {
    if (card.front.length < 3 || card.back.length < 2) return false;
    if (!/[A-Za-z0-9]/.test(card.front + card.back)) return false;
    return true;
  });

  const withoutJunk = meaningful.filter((card) => {
    if (URL_ONLY.test(card.front) || URL_ONLY.test(card.back)) return false;
    if (METADATA_FRONT.test(card.front)) return false;
    return true;
  });

  const withoutMirrors = withoutJunk.filter(
    (card) => card.front.toLowerCase() !== card.back.toLowerCase(),
  );

  return dedupeByNormalized(withoutMirrors, (card) => card.front);
}

const supportedCardCount = (notesLength: number): number =>
  Math.min(20, Math.max(3, Math.floor(notesLength / 220)));

export async function generateCardsFromNotes(notes: string): Promise<DraftCard[]> {
  const maxCards = supportedCardCount(notes.length);

  const { object } = await generateObject({
    model: groq(MODELS.flashcards),
    schema: z.object({
      cards: z
        .array(
          z.object({
            front: z
              .string()
              .describe("The succinct question or prompt for the flashcard."),
            back: z
              .string()
              .describe("The concise core concept or answer."),
          }),
        )
        .describe(
          `An array of high-quality flashcards extracted from the notes, max ${maxCards} cards limit.`,
        ),
    }),
    prompt: GENERATE_CARDS_PROMPT(notes, maxCards),
  });

  return sanitizeGeneratedCards(object.cards).slice(0, maxCards);
}

export async function evaluateUserAnswer(front: string, back: string, userAnswer: string) {
  if (!userAnswer || userAnswer.trim() === "") {
    return {
      score: 0,
      feedback: "You didn't provide an answer. Review the concept and try again!",
    };
  }

  const { object } = await generateObject({
    model: groq(MODELS.evaluation),
    schema: z.object({
      score: z
        .number()
        .min(0)
        .max(5)
        .describe(
          "Score from 0 to 5. 5 = Perfect conceptual match. 4 = Minor omission but correct. 3 = Partially correct. 1-2 = Mostly incorrect. 0 = Completely wrong."
        ),
      feedback: z
        .string()
        .describe(
          "1-2 sentences of encouraging feedback. Briefly explain why they got this score, pointing out what was correct and clarifying any misconceptions against the true answer."
        ),
    }),
    prompt: EVALUATE_ANSWER_PROMPT(front, back, userAnswer),
  });
  
  return object;
}