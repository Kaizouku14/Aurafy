import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import {
  quizAttemptAnswers,
  quizAttempts,
  quizQuestions,
  quizSets,
} from "@/server/db/schema/quiz";
import type { QuizType } from "@/types/quiz/schema";

export type CreateQuizSetInput = {
  id: string;
  userId: string;
  subject: string;
  quizType: QuizType;
};

export type CreateQuizQuestionInput = {
  id: string;
  quizSetId: string;
  prompt: string;
  optionsJson: string | null;
  correctAnswer: string;
  explanation: string;
  difficulty: "medium" | "hard";
};

export type QuizSubmissionAnswer = {
  questionId: string;
  userAnswer: string;
};

export const createQuizSet = async (input: CreateQuizSetInput) => {
  await db.insert(quizSets).values(input);
};

export const createQuizQuestions = async (
  questions: CreateQuizQuestionInput[],
) => {
  await db.insert(quizQuestions).values(questions);
};

export const getUserQuizSets = async (userId: string) => {
  return db.query.quizSets.findMany({
    where: eq(quizSets.userId, userId),
    orderBy: [desc(quizSets.createdAt)],
  });
};

export const getQuizSetByIdAndUser = async (
  quizSetId: string,
  userId: string,
) => {
  return db.query.quizSets.findFirst({
    where: and(eq(quizSets.id, quizSetId), eq(quizSets.userId, userId)),
  });
};

export const getQuizQuestionsBySetId = async (quizSetId: string) => {
  return db.query.quizQuestions.findMany({
    where: eq(quizQuestions.quizSetId, quizSetId),
    orderBy: [desc(quizQuestions.createdAt)],
  });
};

export const createQuizAttempt = async (input: {
  id: string;
  quizSetId: string;
  userId: string;
  score: number;
  totalQuestions: number;
}) => {
  await db.insert(quizAttempts).values(input);
};

export const createQuizAttemptAnswers = async (
  answers: {
    id: string;
    attemptId: string;
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
  }[],
) => {
  if (answers.length === 0) return;
  await db.insert(quizAttemptAnswers).values(answers);
};

export const deleteQuizSetById = async (quizSetId: string) => {
  await db.delete(quizSets).where(eq(quizSets.id, quizSetId));
};

export const gradeQuizSubmission = async (
  quizSetId: string,
  quizType: QuizType,
  answers: QuizSubmissionAnswer[],
) => {
  if (answers.length === 0) {
    return {
      score: 0,
      total: 0,
      review: [] as {
        questionId: string;
        prompt: string;
        userAnswer: string;
        correctAnswer: string;
        explanation: string | null;
        isCorrect: boolean;
      }[],
    };
  }

  const answerMap = new Map(answers.map((a) => [a.questionId, a.userAnswer]));
  const questions = await db.query.quizQuestions.findMany({
    where: and(
      eq(quizQuestions.quizSetId, quizSetId),
      inArray(quizQuestions.id, [...answerMap.keys()]),
    ),
  });

  const review = questions.map((question) => {
    const rawUserAnswer = answerMap.get(question.id) ?? "";

    const isCorrect =
      quizType === "identification"
        ? rawUserAnswer.trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase()
        : rawUserAnswer === question.correctAnswer;

    return {
      questionId: question.id,
      prompt: question.prompt,
      userAnswer: rawUserAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect,
    };
  });

  const score = review.reduce(
    (acc, item) => (item.isCorrect ? acc + 1 : acc),
    0,
  );
  return {
    score,
    total: review.length,
    review,
  };
};
