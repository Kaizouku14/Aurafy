import { z } from "zod";

export const QUIZ_TYPES = [
  "multiple_choice",
  "true_false",
  "identification",
  "open_ended",
] as const;

export const quizTypeSchema = z.enum(QUIZ_TYPES);

export const createQuizSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(100, "Subject is too long"),
  numberOfQuestions: z.string(),
  quizType: quizTypeSchema,
});

export type QuizType = z.infer<typeof quizTypeSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
