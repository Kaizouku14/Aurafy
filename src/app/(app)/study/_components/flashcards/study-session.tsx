"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, BrainCircuit, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export const StudySession = ({ deckId, onFinish }: { deckId: string, onFinish: () => void }) => {
  const { data: dueCards, isLoading } = api.flashcard.getDueCards.useQuery({ deckId });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ score: number, text: string, back: string } | null>(null);

  const submitReview = api.flashcard.submitReview.useMutation({
    onSuccess: (data) => {
      setFeedback({ score: data.score, text: data.feedback, back: data.back });
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin size-10 text-muted-foreground mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Loading Deck...</h2>
      </div>
    );
  }

  if (!dueCards || dueCards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-300">
        <div className="border-4 border-border rounded-base bg-main p-12 text-center shadow-shadow max-w-lg">
          <BrainCircuit className="size-20 mx-auto text-main-foreground mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-widest text-main-foreground mb-4">All Caught Up!</h2>
          <p className="text-main-foreground font-bold mb-8">You've finished all your due cards for this deck today. Outstanding work.</p>
          <Button
            onClick={onFinish}
            className="w-full bg-background text-foreground font-black uppercase tracking-widest text-lg p-6 border-4 border-border hover:bg-muted transition-colors rounded-base"
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
      setCurrentIndex(curr => curr + 1);
    }
  };

  return (
    <div className="flex flex-col size-full max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            onClick={onFinish}
            variant="noShadow"
            className="border-2 border-border gap-2 font-bold px-4 py-2 bg-secondary-background hover:bg-background transition-colors text-foreground"
          >
            <ArrowLeft className="size-4" /> Leave
          </Button>
          <h2 className="text-2xl font-black uppercase tracking-tight">Study Session</h2>
        </div>
        <div className="bg-secondary-background border-2 border-border font-bold px-4 py-2 rounded-base">
          Card {currentIndex + 1} of {dueCards.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="border-4 border-border rounded-base bg-background p-6 md:p-8 shadow-sm flex flex-col justify-center min-h-[250px]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Concept to Recall</h3>
          <p className="text-2xl md:text-4xl font-black leading-tight">{currentCard.front}</p>
        </div>

        {!feedback ? (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
            <div className="flex-1 border-4 border-border rounded-base bg-secondary-background overflow-hidden flex flex-col transition-all">
              <div className="bg-border px-4 py-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Answer</span>
              </div>
              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Explain the concept in your own words..."
                className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-base text-lg focus:border-none focus:"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={!userAnswer.trim() || submitReview.isPending}
              className="w-full bg-foreground text-background font-black uppercase tracking-widest text-xl p-6 rounded-base border-4 border-transparent hover:bg-main hover:text-main-foreground transition-all "
            >
               {submitReview.isPending ? <Loader2 className="animate-spin size-6" /> : "Evaluate Answer"}
            </Button>
          </form>
        ) : (
          <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
             <div className="border-4 border-border rounded-base bg-secondary-background p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">True Answer</h3>
                <p className="text-lg font-base">{feedback.back}</p>
             </div>

             <div className={cn(
               "border-4 border-border rounded-base p-6",
               feedback.score >= 4 ? "bg-main text-main-foreground" :
               feedback.score >= 2 ? "bg-yellow-400 text-black" :
               "bg-destructive text-destructive-foreground"
             )}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">AI Evaluation</h3>
                  <span className="text-3xl font-black">{feedback.score}/5</span>
                </div>
                <p className="text-lg font-bold leading-snug">{feedback.text}</p>
             </div>

             <Button
              onClick={handleNext}
              className="mt-auto w-full bg-foreground text-background font-black uppercase tracking-widest text-xl p-8 rounded-base border-4 border-transparent hover:bg-muted transition-all gap-3"
            >
               Next Card <ArrowRight className="size-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
