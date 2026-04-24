"use client";

import React from "react";
import { BookMarked } from "lucide-react";
import { QuizCreator } from "./quiz-creator";

export const QuizEmptyState = () => {
  return (
    <div className="border-border rounded-base bg-secondary-background/50 flex flex-1 flex-col items-center justify-center border-4 border-dashed p-12 text-center">
      <BookMarked className="text-muted-foreground mb-4 size-16" />
      <h3 className="mb-2 text-xl font-bold uppercase">No Quizzes Yet</h3>
      <p className="text-muted-foreground font-base mb-6 max-w-md">
        Upload a PDF and choose quiz type to generate medium-to-hard questions.
      </p>
      <QuizCreator className="bg-main text-main-foreground hover:bg-main/90" />
    </div>
  );
};
