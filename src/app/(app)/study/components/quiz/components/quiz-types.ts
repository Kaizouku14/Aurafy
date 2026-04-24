import type { QuizType } from "@/types/quiz/schema";

export const quizTypeLabel: Record<QuizType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True or False",
  identification: "Identification",
};

export type QuizCardItem = {
  id: string;
  subject: string;
  quizType: QuizType;
  createdAt: Date;
};
