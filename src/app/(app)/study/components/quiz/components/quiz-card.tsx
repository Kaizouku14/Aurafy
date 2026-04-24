"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlayCircle, Trash2 } from "lucide-react";
import type { QuizType } from "@/types/quiz/schema";
import { quizTypeLabel } from "@/types/quiz";

type QuizCardProps = {
  quiz: {
    id: string;
    subject: string;
    quizType: QuizType;
  };
  isDeleting: boolean;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
};

export const QuizCard = ({
  quiz,
  isDeleting,
  onDelete,
  onSelect,
}: QuizCardProps) => {
  return (
    <div className="group border-border rounded-base bg-secondary-background shadow-shadow relative flex flex-col border-4 p-5 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
      <Button
        variant="noShadow"
        size="icon"
        onClick={() => onDelete(quiz.id)}
        disabled={isDeleting}
        className="rounded-base text-main-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 absolute top-3 right-3 border-2 border-transparent transition-all group-hover:opacity-100 md:opacity-0"
      >
        <Trash2 className="size-4" />
      </Button>

      <div className="mb-6 flex-1 space-y-3">
        <h3 className="line-clamp-2 pr-8 text-xl leading-tight font-black">
          {quiz.subject}
        </h3>
        <div className="text-muted-foreground text-sm font-bold">
          {quizTypeLabel[quiz.quizType]}
        </div>
      </div>

      <Button
        onClick={() => onSelect(quiz.id)}
        className="bg-foreground text-background hover:bg-main hover:text-main-foreground hover:border-border h-12 w-full gap-2 border-2 border-transparent px-6 font-bold transition-colors"
      >
        <PlayCircle className="size-5" /> Start Quiz
      </Button>
    </div>
  );
};
