import { z } from "zod";

export const QUIZ_TYPES = [
  "multiple_choice",
  "true_false",
  "identification",
] as const;

export const QUIZ_DIFFICULTIES = ["medium", "hard"] as const;

export const quizTypeSchema = z.enum(QUIZ_TYPES);

export const createQuizSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(100, "Subject is too long"),
  numberOfQuestions: z.string(),
  quizType: quizTypeSchema,
});

export const multipleChoiceQuestionSchema = z.object({
  prompt: z.string().min(10),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
  difficulty: z.enum(QUIZ_DIFFICULTIES),
});

export const trueFalseQuestionSchema = z.object({
  prompt: z.string().min(10),
  options: z.tuple([z.literal("True"), z.literal("False")]),
  correctAnswer: z.enum(["True", "False"]),
  explanation: z.string().min(1),
  difficulty: z.enum(QUIZ_DIFFICULTIES),
});

export const identificationQuestionSchema = z.object({
  prompt: z.string().min(10),
  options: z.null(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
  difficulty: z.enum(QUIZ_DIFFICULTIES),
});

export const quizQuestionSchema = z.union([
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  identificationQuestionSchema,
]);

export type QuizType = z.infer<typeof quizTypeSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
