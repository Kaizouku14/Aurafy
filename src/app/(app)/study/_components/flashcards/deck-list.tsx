"use client";

import React, { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { DeckCreator } from "./deck-creator";
import { Button } from "@/components/ui/button";
import { Library, PlayCircle, Calendar, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { sileo } from "sileo";
import { StaggerList } from "@/components/animation/stagger-list";

export const DeckList = ({ onSelectDeck }: { onSelectDeck: (id: string, subject: string) => void }) => {
  const { data: decks, isLoading } = api.flashcard.getDecks.useQuery();
  const utils = api.useUtils();
  const [isDragging, setIsDragging] = useState(false);

  const deleteDeck = api.flashcard.deleteDeck.useMutation({
    onSuccess: () => {
      utils.flashcard.getDecks.invalidate();
    },
  });

  const handleDelete = useCallback((deckId: string, subject: string) => {
   sileo.action({
    title: `Delete "${subject}"?`,
    description: "This will delete the deck and all its cards. This cannot be undone.",
    button: {
        title: "Delete",
        onClick: () => deleteDeck.mutate({ deckId }),
    },
    });
  }, [deleteDeck]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-border pb-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Your Decks</h2>
          <p className="text-muted-foreground font-base mt-2">Study hard, let the AI handle the scheduling.</p>
        </div>
        <DeckCreator />
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <p className="animate-pulse font-bold text-lg uppercase tracking-widest text-muted-foreground">Loading decks...</p>
        </div>
      ) : !decks || decks.length === 0 ? (
        <div
          className={cn(
            "flex-1 flex flex-col items-center justify-center border-4 border-dashed rounded-base bg-secondary-background/50 p-12 text-center transition-all",
            isDragging ? "border-main bg-main/10 scale-[1.01]" : "border-border"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging ? (
            <Upload className="size-16 text-main mb-4 animate-bounce" />
          ) : (
            <Library className="size-16 text-muted-foreground mb-4" />
          )}
          <h3 className="text-xl font-bold uppercase mb-2">
            {isDragging ? "Drop Your PDF" : "No Decks Yet"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md font-base">
            {isDragging
              ? "Release to create a new flashcard deck from your PDF."
              : "Upload a PDF or paste your notes and the AI will automatically extract flashcards and create a spaced-repetition schedule."}
          </p>
          {!isDragging && (
            <DeckCreator className="bg-main text-main-foreground hover:bg-main/90" />
          )}
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20" itemDistance={20} staggerDelay={0.08}>
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="group relative flex flex-col border-4 border-border rounded-base bg-secondary-background p-5 shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Button
                variant="noShadow"
                size="icon"
                disabled={deleteDeck.isPending}
                className="absolute top-3 right-3 rounded-base border-2 border-transparent text-main-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-all md:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </Button>

              <div className="flex-1 space-y-3 mb-6">
                <h3 className="font-black text-xl leading-tight line-clamp-2 pr-8">{deck.subject}</h3>
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Exam: {deck.examDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Today</span>
                  <span className="text-3xl font-black text-main leading-none">{deck.dueCardsCount}</span>
                </div>
                <Button
                  onClick={() => onSelectDeck(deck.id, deck.subject)}
                  disabled={deck.dueCardsCount === 0}
                  className="bg-foreground text-background border-2 border-transparent gap-2 font-bold hover:bg-main hover:text-main-foreground hover:border-border transition-colors h-12 px-6"
                >
                  <PlayCircle className="size-5" />
                  {deck.dueCardsCount === 0 ? "DONE" : "STUDY"}
                </Button>
              </div>
            </div>
          ))}
        </StaggerList>
      )}
    </div>
  );
};
