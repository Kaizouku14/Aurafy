"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { QuizReviewItem } from "@/types/quiz";

interface QuizResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  total: number;
  review: QuizReviewItem[];
  onBack: () => void;
}

export const QuizResultsDialog = ({
  open,
  onOpenChange,
  score,
  total,
  review,
  onBack,
}: QuizResultsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-4 border-border bg-secondary-background max-h-[85vh] max-w-3xl p-0">
        <DialogHeader className="border-border border-b-2 px-5 py-4">
          <DialogTitle className="text-xl font-black tracking-wider uppercase">
            Quiz Results
          </DialogTitle>
          <DialogDescription className="font-bold">
            Score: {score}/{total}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[58vh]">
          <div className="space-y-3 p-4">
            {review.map((item, index) => (
              <div
                key={item.questionId}
                className={cn(
                  "rounded-base border-2 p-4",
                  item.isCorrect
                    ? "border-emerald-500/70 bg-emerald-500/10"
                    : "border-destructive/70 bg-destructive/10",
                )}
              >
                <p className="text-xs font-black tracking-widest uppercase opacity-80">
                  Question {index + 1}
                </p>
                <p className="mt-1 text-sm font-bold leading-snug">{item.prompt}</p>

                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="font-black uppercase tracking-wide">Your Answer: </span>
                    <span className={item.isCorrect ? "text-emerald-700" : "text-destructive"}>
                      {item.userAnswer || "(No answer)"}
                    </span>
                  </p>

                  {typeof item.score === "number" && (
                    <p>
                      <span className="font-black uppercase tracking-wide">AI Score: </span>
                      <span className={item.score >= 4 ? "text-emerald-700" : item.score >= 2 ? "text-yellow-700" : "text-destructive"}>
                        {item.score}/5
                      </span>
                    </p>
                  )}

                  {!item.isCorrect && (
                    <p>
                      <span className="font-black uppercase tracking-wide">Reference Answer: </span>
                      <span className="text-emerald-700">{item.correctAnswer}</span>
                    </p>
                  )}

                  {item.feedback ? (
                    <p className="text-muted-foreground rounded-base bg-background/60 mt-2 border border-border p-3 text-xs leading-relaxed font-base whitespace-pre-wrap">
                      {item.feedback}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs font-base pt-1">
                      {item.isCorrect ? "Correct" : "Incorrect"}
                      {item.explanation ? ` - ${item.explanation}` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="border-border border-t-2 px-5 py-4">
          <Button
            onClick={onBack}
            className="bg-foreground text-background hover:bg-main hover:text-main-foreground border-2 border-transparent font-black uppercase"
          >
            Back to Quizzes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
