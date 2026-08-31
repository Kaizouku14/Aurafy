"use client";

import React from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Loading } from "../shared/loading";
import { StaggerList } from "@/components/animation/stagger-list";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { useConfirmDelete } from "../shared/use-confirm-delete";
import { CardEditorDialog } from "./card-editor-dialog";
import {
  ArrowLeft,
  BrainCircuit,
  Calendar,
  Pencil,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { sileo } from "sileo";

export const DeckManager = ({
  deckId,
  onBack,
  onStudy,
}: {
  deckId: string;
  onBack: () => void;
  onStudy: () => void;
}) => {
  const { data, isLoading } = api.flashcard.getDeckCards.useQuery({ deckId });
  const utils = api.useUtils();
  const { pendingId, isOpen, openConfirm, closeConfirm } = useConfirmDelete();

  const cards = data?.cards ?? [];
  const deck = data?.deck ?? null;

  const todayStr = new Date().toISOString().split("T")[0]!;
  const dueCount = cards.filter(
    (card) => !card.nextReviewAt || card.nextReviewAt <= todayStr,
  ).length;

  const deleteCard = api.flashcard.deleteCard.useMutation({
    onSuccess: () => {
      void utils.flashcard.getDeckCards.invalidate();
      void utils.flashcard.getDecks.invalidate();
    },
    onError: () => {
      sileo.error({
        title: "Failed to delete card",
        description: "Please try again.",
      });
    },
  });

  const pendingCard = cards.find((card) => card.id === pendingId) ?? null;

  const confirmDelete = async () => {
    if (!pendingId || deleteCard.isPending) return;

    try {
      await deleteCard.mutateAsync({ flashcardId: pendingId });
      closeConfirm();
    } catch {
      // handled in mutation onError
    }
  };

  if (isLoading) {
    return <Loading text="Cards" />;
  }

  return (
    <div className="animate-fade-enter mx-auto flex size-full max-w-5xl flex-col p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={onBack}
            variant="noShadow"
            className="border-border bg-secondary-background hover:bg-background text-foreground gap-1.5 border-2 px-3 py-1.5 font-bold transition-colors"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <div>
            <h2 className="text-xl leading-tight font-black tracking-tight uppercase sm:text-2xl">
              {deck?.subject ?? "Deck"}
            </h2>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-bold">
              <Calendar className="size-4" />
              <span>Exam: {deck?.examDate}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CardEditorDialog deckId={deckId} />
          <Button
            onClick={onStudy}
            disabled={dueCount === 0}
            className="bg-foreground text-background hover:bg-main hover:text-main-foreground hover:border-border h-12 gap-2 border-2 border-transparent px-5 font-bold transition-colors"
          >
            <PlayCircle className="size-5" />
            {dueCount === 0 ? "DONE" : `STUDY (${dueCount})`}
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="border-border bg-secondary-background/50 flex flex-1 flex-col items-center justify-center rounded-base border-4 border-dashed p-12 text-center">
          <BrainCircuit className="text-muted-foreground mb-4 size-16" />
          <h3 className="mb-2 text-xl font-bold uppercase">No Cards Yet</h3>
          <p className="text-muted-foreground font-base mb-6 max-w-md">
            This deck is empty. Add your first flashcard manually.
          </p>
          <CardEditorDialog
            deckId={deckId}
            trigger={
              <Button className="bg-main text-main-foreground border-border hover:bg-main/90 gap-2 border-2 px-4 py-2 font-bold">
                Add Your First Card
              </Button>
            }
          />
        </div>
      ) : (
        <StaggerList
          className="grid grid-cols-1 gap-4 pb-20"
          itemDistance={20}
          staggerDelay={0.06}
        >
          {cards.map((card) => {
            const isDue = !card.nextReviewAt || card.nextReviewAt <= todayStr;
            return (
              <div
                key={card.id}
                className="border-border rounded-base bg-background group border-2 p-4 shadow-sm transition-colors"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={
                        isDue
                          ? "rounded-base bg-main text-main-foreground px-2 py-0.5 text-[10px] font-black tracking-widest uppercase"
                          : "rounded-base bg-border text-foreground px-2 py-0.5 text-[10px] font-black tracking-widest uppercase"
                      }
                    >
                      {isDue ? "Due" : "Scheduled"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <CardEditorDialog
                      deckId={deckId}
                      card={{
                        id: card.id,
                        front: card.front,
                        back: card.back,
                      }}
                      trigger={
                        <Button
                          type="button"
                          variant="noShadow"
                          size="icon"
                          aria-label="Edit card"
                          className="rounded-base hover:bg-main hover:text-main-foreground h-8 w-8 cursor-pointer border-2 border-transparent bg-transparent"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <Button
                      type="button"
                      variant="noShadow"
                      size="icon"
                      aria-label="Delete card"
                      onClick={() => openConfirm(card.id)}
                      disabled={deleteCard.isPending}
                      className="rounded-base hover:border-destructive hover:bg-destructive/10 h-8 w-8 cursor-pointer border-2 border-transparent bg-transparent text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-lg leading-snug font-black">{card.front}</p>
                <p className="text-muted-foreground font-base mt-1 leading-snug">
                  {card.back}
                </p>
              </div>
            );
          })}
        </StaggerList>
      )}

      <ConfirmDeleteDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !deleteCard.isPending) closeConfirm();
        }}
        title="Delete card?"
        message={
          pendingCard
            ? `This will permanently delete "${pendingCard.front.slice(0, 60)}".`
            : "This will permanently delete this card."
        }
        isPending={deleteCard.isPending}
        onConfirm={() => {
          void confirmDelete();
        }}
      />
    </div>
  );
};