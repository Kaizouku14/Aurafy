"use client";

import React, { useMemo, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { sileo } from "sileo";
import { QuizResultsDialog } from "./components/quiz-results-dialog";
import { QuizAnswerInput } from "./components/quiz-answer-input";
import { QuizSessionFooter } from "./components/quiz-session-footer";
import type { QuizResultSummary } from "@/types/quiz";
import { Loading } from "../shared/loading";

type QuizSessionProps = {
  quizSetId: string;
  onFinish: () => void;
};

export const QuizSession = ({ quizSetId, onFinish }: QuizSessionProps) => {
  const { data: quiz, isLoading } = api.quiz.getQuizById.useQuery({
    quizSetId,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [resultSummary, setResultSummary] = useState<QuizResultSummary | null>(
    null,
  );

  const submitAttempt = api.quiz.submitAttempt.useMutation({
    onError: () => {
      sileo.error({
        title: "Failed to submit quiz",
        description: "Please try again.",
      });
    },
  });

  const currentQuestion = quiz?.questions[currentIndex];

  const progressText = useMemo(() => {
    if (!quiz) return "";
    return `Question ${currentIndex + 1} of ${quiz.questions.length}`;
  }, [currentIndex, quiz]);

  if (isLoading) {
    return <Loading text="Quiz" />;
  }

  if (!quiz || quiz.questions.length === 0 || !currentQuestion) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-lg font-bold uppercase">
            Quiz has no questions.
          </p>
          <Button onClick={onFinish} className="mt-4">
            Back to Quiz List
          </Button>
        </div>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestion.id] ?? "";
  const isLast = currentIndex === quiz.questions.length - 1;
  const disabled = !currentAnswer.trim() || submitAttempt.isPending;

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const goNext = async () => {
    if (!currentAnswer.trim()) return;

    if (!isLast) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    const payload = quiz.questions.map((question) => ({
      questionId: question.id,
      userAnswer: (answers[question.id] ?? "").trim(),
    }));

    const result = await submitAttempt.mutateAsync({
      quizSetId: quiz.id,
      quizType: quiz.quizType,
      answers: payload,
    });

    setResultSummary(result);
    setResultsDialogOpen(true);
  };

  const onEnterPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.repeat) {
      e.preventDefault();
      goNext();
    }
  };

  return (
    <>
      <div
        className="animate-in fade-in mx-auto flex size-full max-w-4xl flex-col p-3 duration-300 sm:p-4 md:p-8"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) {
            goNext();
          }
        }}
      >
        <div className="mb-4 flex items-center justify-between sm:mb-8">
          <Button
            onClick={onFinish}
            variant="noShadow"
            className="border-border bg-secondary-background hover:bg-background text-foreground gap-1.5 border-2 px-3 py-1.5 font-bold transition-colors"
          >
            Leave
          </Button>
          <div className="bg-secondary-background border-border rounded-base border-2 px-3 py-1.5 text-sm font-bold">
            {progressText}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <div className="border-border rounded-base bg-background border-4 p-6">
            <p className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
              {quiz.subject}
            </p>
            <h3 className="text-xl leading-tight font-black sm:text-2xl">
              {currentQuestion.prompt}
            </h3>
          </div>
          <QuizAnswerInput
            options={currentQuestion.options}
            currentAnswer={currentAnswer}
            onChange={setAnswer}
          />
          <QuizSessionFooter
            isPending={submitAttempt.isPending}
            isLast={isLast}
            disabled={disabled}
            onNext={() => {
              void goNext();
            }}
            onEnterPress={onEnterPress}
          />
        </div>
      </div>

      <QuizResultsDialog
        open={resultsDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setResultsDialogOpen(false);
            onFinish();
          }
        }}
        score={resultSummary?.score ?? 0}
        total={resultSummary?.total ?? 0}
        review={resultSummary?.review ?? []}
        onBack={() => {
          setResultsDialogOpen(false);
          onFinish();
        }}
      />
    </>
  );
};
