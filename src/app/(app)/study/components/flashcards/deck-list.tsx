"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { DeckCreator } from "./deck-creator";
import { Button } from "@/components/ui/button";
import { Library, PlayCircle, Calendar, Trash2, Upload, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { StaggerList } from "@/components/animation/stagger-list";
import { ListSection } from "../shared/list-section";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { useConfirmDelete } from "../shared/use-confirm-delete";
import { sileo } from "sileo";

export const DeckList = ({
  onSelectDeck,
  onManageDeck,
}: {
  onSelectDeck: (id: string, subject: string) => void;
  onManageDeck: (id: string) => void;
}) => {
  const { data: decks, isLoading } = api.flashcard.getDecks.useQuery();
  const utils = api.useUtils();
  const [isDragging, setIsDragging] = useState(false);
  const { pendingId, isOpen, openConfirm, closeConfirm } = useConfirmDelete();

  const deleteDeck = api.flashcard.deleteDeck.useMutation({
    onSuccess: () => {
      void utils.flashcard.getDecks.invalidate();
    },
    onError: () => {
      sileo.error({
        title: "Failed to delete deck",
        description: "Please try again.",
      });
    },
  });

  const pendingDeck = decks?.find((deck) => deck.id === pendingId) ?? null;

  const confirmDeleteDeck = async () => {
    if (!pendingId || deleteDeck.isPending) return;

    try {
      await deleteDeck.mutateAsync({ deckId: pendingId });
      closeConfirm();
    } catch {
      // handled in mutation onError
    }
  };

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
    <>
      <ListSection
        title="Your Decks"
        description="Study hard, let the AI handle the scheduling."
        action={<DeckCreator />}
        isLoading={isLoading}
        loadingLabel="Loading decks..."
        isEmpty={!decks || decks.length === 0}
        emptyState={
          <div
            className={cn(
              "rounded-base bg-secondary-background/50 flex flex-1 flex-col items-center justify-center border-4 border-dashed p-12 text-center transition-all",
              isDragging
                ? "border-main bg-main/10 scale-[1.01]"
                : "border-border",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging ? (
              <Upload className="text-main mb-4 size-16 animate-bounce" />
            ) : (
              <Library className="text-muted-foreground mb-4 size-16" />
            )}
            <h3 className="mb-2 text-xl font-bold uppercase">
              {isDragging ? "Drop Your PDF" : "No Decks Yet"}
            </h3>
            <p className="text-muted-foreground font-base mb-6 max-w-md">
              {isDragging
                ? "Release to create a new flashcard deck from your PDF."
                : "Upload a PDF or paste your notes and the AI will automatically extract flashcards and create a spaced-repetition schedule."}
            </p>
            {!isDragging && (
              <DeckCreator className="bg-main text-main-foreground hover:bg-main/90" />
            )}
          </div>
        }
      >
        <StaggerList
          className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3"
          itemDistance={20}
          staggerDelay={0.08}
        >
          {decks?.map((deck) => (
            <div
              key={deck.id}
              className="group border-border rounded-base bg-secondary-background shadow-shadow relative flex flex-col border-4 p-5 transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Button
                variant="noShadow"
                size="icon"
                onClick={() => openConfirm(deck.id)}
                disabled={deleteDeck.isPending}
                className="rounded-base text-destructive hover:border-destructive hover:bg-destructive/10 absolute top-3 right-3 cursor-pointer border-2 border-transparent bg-transparent transition-opacity group-hover:opacity-100 md:opacity-0"
              >
                <Trash2 className="size-4" />
              </Button>

              <div className="mb-6 flex-1 space-y-3">
                <h3 className="line-clamp-2 pr-8 text-xl leading-tight font-black">
                  {deck.subject}
                </h3>
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                  <Calendar className="size-4" />
                  <span>Exam: {deck.examDate}</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Due Today
                  </span>
                  <span className="text-main text-3xl leading-none font-black">
                    {deck.dueCardsCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                <Button
                  variant="noShadow"
                  size="icon"
                  aria-label="Manage cards"
                  onClick={() => onManageDeck(deck.id)}
                  className="border-border text-foreground hover:bg-main hover:text-main-foreground h-11 w-11 cursor-pointer rounded-md border-2 bg-background font-bold transition-colors"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  onClick={() => onSelectDeck(deck.id, deck.subject)}
                  disabled={deck.dueCardsCount === 0}
                  className="bg-foreground text-background hover:bg-main hover:text-main-foreground hover:border-border h-12 gap-2 border-2 border-transparent px-6 font-bold transition-colors"
                >
                  <PlayCircle className="size-5" />
                  {deck.dueCardsCount === 0 ? "DONE" : "STUDY"}
                </Button>
                </div>
              </div>
            </div>
          ))}
        </StaggerList>
      </ListSection>

      <ConfirmDeleteDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !deleteDeck.isPending) closeConfirm();
        }}
        title="Delete deck?"
        message={
          pendingDeck
            ? `This will permanently delete "${pendingDeck.subject}".`
            : "This will permanently delete this deck."
        }
        isPending={deleteDeck.isPending}
        onConfirm={() => {
          void confirmDeleteDeck();
        }}
      />
    </>
  );
};
