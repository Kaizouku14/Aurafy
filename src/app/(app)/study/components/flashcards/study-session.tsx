"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, BrainCircuit, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export const StudySession = ({
  deckId,
  onFinish,
}: {
  deckId: string;
  onFinish: () => void;
}) => {
  const { data: dueCards, isLoading } = api.flashcard.getDueCards.useQuery({
    deckId,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    score: number;
    text: string;
    back: string;
  } | null>(null);

  const submitReview = api.flashcard.submitReview.useMutation({
    onSuccess: (data) => {
      setFeedback({ score: data.score, text: data.feedback, back: data.back });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <Loader2 className="text-muted-foreground mb-4 size-10 animate-spin" />
        <h2 className="text-muted-foreground text-xl font-black tracking-widest uppercase">
          Loading Deck...
        </h2>
      </div>
    );
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <div className="animate-in fade-in zoom-in-95 flex h-full flex-1 flex-col items-center justify-center duration-300">
        <div className="border-border rounded-base bg-main shadow-shadow mx-4 max-w-lg border-4 p-6 text-center sm:p-12">
          <BrainCircuit className="text-main-foreground mx-auto mb-4 size-14 sm:mb-6 sm:size-20" />
          <h2 className="text-main-foreground mb-4 text-xl font-black tracking-widest uppercase sm:text-3xl">
            All Caught Up!
          </h2>
          <p className="text-main-foreground mb-8 font-bold">
            You&apos;ve finished all your due cards for this deck today.
            Outstanding work.
          </p>
          <Button
            onClick={onFinish}
            className="bg-background text-foreground border-border hover:bg-muted rounded-base w-full border-4 p-6 text-lg font-black tracking-widest uppercase transition-colors"
          >
            Back to Decks
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  if (!currentCard) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || submitReview.isPending) return;
    submitReview.mutate({ flashcardId: currentCard.id, userAnswer });
  };

  const handleNext = () => {
    setFeedback(null);
    setUserAnswer("");
    if (currentIndex + 1 >= dueCards.length) {
      onFinish();
    } else {
      setCurrentIndex((curr) => curr + 1);
    }
  };

  return (
    <div className="animate-in fade-in mx-auto flex size-full max-w-4xl flex-col p-3 duration-300 sm:p-4 md:p-8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={onFinish}
            variant="noShadow"
            className="border-border bg-secondary-background hover:bg-background text-foreground gap-1.5 border-2 px-3 py-1.5 font-bold transition-colors"
          >
            <ArrowLeft className="size-4" /> Leave
          </Button>
          <h2 className="text-lg font-black tracking-tight uppercase sm:text-2xl">
            Study Session
          </h2>
        </div>
        <div className="bg-secondary-background border-border rounded-base border-2 px-3 py-1.5 text-center text-sm font-bold">
          Card {currentIndex + 1} of {dueCards.length}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="border-border rounded-base bg-background flex min-h-37.5 flex-col justify-center border-4 p-4 shadow-sm sm:min-h-62.5 sm:p-6 md:p-8">
          <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase sm:mb-4">
            Concept to Recall
          </h3>
          <p className="text-xl leading-tight font-black sm:text-2xl md:text-4xl">
            {currentCard.front}
          </p>
        </div>

        {!feedback ? (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
            <div className="border-border rounded-base bg-secondary-background flex flex-1 flex-col overflow-hidden border-4 transition-all">
              <div className="bg-border px-4 py-2">
                <span className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Your Answer
                </span>
              </div>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Explain the concept in your own words..."
                className="font-base focus: w-full flex-1 resize-none bg-transparent p-4 text-lg outline-none focus:border-none"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={!userAnswer.trim() || submitReview.isPending}
              className="bg-foreground text-background rounded-base hover:bg-main hover:text-main-foreground w-full border-4 border-transparent p-4 text-base font-black tracking-widest uppercase transition-all sm:p-6 sm:text-xl"
            >
              {submitReview.isPending ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                "Evaluate Answer"
              )}
            </Button>
          </form>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 flex flex-1 flex-col gap-6 duration-300">
            <div className="border-border rounded-base bg-secondary-background border-4 p-6">
              <h3 className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                True Answer
              </h3>
              <p className="font-base text-lg">{feedback.back}</p>
            </div>

            <div
              className={cn(
                "border-border rounded-base border-4 p-6",
                feedback.score >= 4
                  ? "bg-main text-main-foreground"
                  : feedback.score >= 2
                    ? "bg-yellow-400 text-black"
                    : "bg-destructive text-destructive-foreground",
              )}
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xs font-bold tracking-widest uppercase opacity-80">
                  AI Evaluation
                </h3>
                <span className="text-3xl font-black">{feedback.score}/5</span>
              </div>
              <p className="text-lg leading-snug font-bold">{feedback.text}</p>
            </div>

            <Button
              onClick={handleNext}
              className="bg-foreground text-background rounded-base hover:bg-muted mt-auto w-full gap-3 border-4 border-transparent p-4 text-base font-black tracking-widest uppercase transition-all sm:p-8 sm:text-xl"
            >
              Next Card <ArrowRight className="size-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
