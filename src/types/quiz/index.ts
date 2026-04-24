export type QuizReviewItem = {
  questionId: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string | null;
  isCorrect: boolean;
};

export type QuizResultSummary = {
  score: number;
  total: number;
  review: QuizReviewItem[];
};
