import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createQuizAttempt,
  createQuizAttemptAnswers,
  deleteQuizSetById,
  getQuizQuestionsBySetId,
  getQuizSetByIdAndUser,
  getUserQuizSets,
  gradeQuizSubmission,
} from "@/lib/api/quiz/queries";
import { QUIZ_TYPES, quizTypeSchema, type QuizType } from "@/types/quiz/schema";

const normalizeQuizType = (value: string): QuizType => {
  if (QUIZ_TYPES.includes(value as QuizType)) {
    return value as QuizType;
  }

  return "multiple_choice";
};

export const quizRouter = createTRPCRouter({
  getQuizSets: protectedProcedure.query(async ({ ctx }) => {
    const sets = await getUserQuizSets(ctx.session.user.id);

    return sets.map((set) => ({
      id: set.id,
      subject: set.subject,
      quizType: normalizeQuizType(set.quizType),
      createdAt: set.createdAt,
    }));
  }),

  getQuizById: protectedProcedure
    .input(z.object({ quizSetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const set = await getQuizSetByIdAndUser(input.quizSetId, ctx.session.user.id);

      if (!set) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
      }

      const questions = await getQuizQuestionsBySetId(input.quizSetId);

      return {
        id: set.id,
        subject: set.subject,
        quizType: normalizeQuizType(set.quizType),
        questions: questions.map((question) => {
          const options = question.optionsJson
            ? (JSON.parse(question.optionsJson) as string[])
            : null;

          return {
            id: question.id,
            prompt: question.prompt,
            options,
            difficulty: question.difficulty,
            explanation: question.explanation,
          };
        }),
      };
    }),

  submitAttempt: protectedProcedure
    .input(
      z.object({
        quizSetId: z.string(),
        quizType: quizTypeSchema,
        answers: z.array(
          z.object({
            questionId: z.string(),
            userAnswer: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const set = await getQuizSetByIdAndUser(input.quizSetId, ctx.session.user.id);

      if (!set) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
      }

      const graded = await gradeQuizSubmission(
        input.quizSetId,
        input.quizType,
        input.answers,
      );

      const attemptId = nanoid();
      await createQuizAttempt({
        id: attemptId,
        quizSetId: input.quizSetId,
        userId: ctx.session.user.id,
        score: graded.score,
        totalQuestions: graded.total,
      });

      await createQuizAttemptAnswers(
        graded.review.map((item) => ({
          id: nanoid(),
          attemptId,
          questionId: item.questionId,
          userAnswer: item.userAnswer,
          isCorrect: item.isCorrect,
        })),
      );

      return {
        attemptId,
        score: graded.score,
        total: graded.total,
        review: graded.review,
      };
    }),

  deleteQuizSet: protectedProcedure
    .input(z.object({ quizSetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const set = await getQuizSetByIdAndUser(input.quizSetId, ctx.session.user.id);

      if (!set) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quiz not found" });
      }

      await deleteQuizSetById(input.quizSetId);
      return { success: true };
    }),
});
