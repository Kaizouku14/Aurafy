import type { QuizType } from "./schema";

export type QuizReviewItem = {
  questionId: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string | null;
  isCorrect: boolean;
  score?: number;
  feedback?: string | null;
};

export type QuizResultSummary = {
  score: number;
  total: number;
  review: QuizReviewItem[];
};

export const quizTypeLabel: Record<QuizType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True or False",
  identification: "Identification",
  open_ended: "Open Ended",
};

export type QuizCardItem = {
  id: string;
  subject: string;
  quizType: QuizType;
  createdAt: Date;
};
