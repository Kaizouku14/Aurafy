import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { MODELS } from "./models";
import { GENERATE_CARDS_PROMPT, EVALUATE_ANSWER_PROMPT } from "./prompt";

export async function generateCardsFromNotes(notes: string) {
  const { object } = await generateObject({
    model: groq(MODELS.default),
    schema: z.object({
      cards: z.array(
        z.object({
          front: z.string().describe("The succinct question or prompt for the flashcard."),
          back: z.string().describe("The concise core concept or answer."),
        })
      ).describe("An array of high-quality flashcards extracted from the notes, max 20 cards limit."),
    }),
    prompt: GENERATE_CARDS_PROMPT(notes),
  });
  return object.cards;
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
