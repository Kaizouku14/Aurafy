"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuizAnswerInputProps = {
  options: string[] | null;
  currentAnswer: string;
  onChange: (value: string) => void;
};

export const QuizAnswerInput = ({
  options,
  currentAnswer,
  onChange,
}: QuizAnswerInputProps) => {
  if (Array.isArray(options)) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = currentAnswer === option;

          return (
            <Button
              key={option}
              type="button"
              variant={selected ? "default" : "neutral"}
              className="h-auto min-h-16 justify-start px-4 py-3 text-left text-sm font-bold"
              onClick={() => onChange(option)}
            >
              {option}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="border-border rounded-base bg-secondary-background border-4 p-4">
      <Input
        value={currentAnswer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your exact answer"
        className="border-2 border-border bg-background text-foreground font-bold"
      />
      <p className="text-muted-foreground mt-2 text-xs font-bold uppercase tracking-wide">
        Exact match is required for identification quizzes.
      </p>
    </div>
  );
};
