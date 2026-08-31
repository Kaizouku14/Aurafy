"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CardDraftSchema,
  type CardDraftInput,
} from "@/types/schema/flashcard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus } from "lucide-react";

interface CardEditorDialogProps {
  deckId: string;
  card?: { id: string; front: string; back: string };
  trigger?: React.ReactNode;
  onSaved?: () => void;
}

export const CardEditorDialog = ({
  deckId,
  card,
  trigger,
  onSaved,
}: CardEditorDialogProps) => {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(card);

  const utils = api.useUtils();

  const invalidateCards = () => {
    void utils.flashcard.getDeckCards.invalidate();
    void utils.flashcard.getDecks.invalidate();
  };

  const createCard = api.flashcard.createCard.useMutation({
    onSuccess: () => {
      invalidateCards();
      onSaved?.();
      setOpen(false);
    },
  });

  const updateCard = api.flashcard.updateCard.useMutation({
    onSuccess: () => {
      invalidateCards();
      onSaved?.();
      setOpen(false);
    },
  });

  const form = useForm<CardDraftInput>({
    resolver: zodResolver(CardDraftSchema),
    defaultValues: { front: "", back: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ front: card?.front ?? "", back: card?.back ?? "" });
      createCard.reset();
      updateCard.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isPending = createCard.isPending || updateCard.isPending;
  const mutationError = createCard.error?.message ?? updateCard.error?.message;

  const onSubmit = (data: CardDraftInput) => {
    if (isEditing && card) {
      updateCard.mutate({
        flashcardId: card.id,
        front: data.front,
        back: data.back,
      });
    } else {
      createCard.mutate({ deckId, front: data.front, back: data.back });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 border-2 border-border px-4 py-2 font-bold">
            {isEditing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
            {isEditing ? "Edit" : "Add Card"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-secondary-background max-h-[90vh] overflow-y-auto border-4 p-6 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-black tracking-widest uppercase">
            {isEditing ? "Edit Card" : "Add Flashcard"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Card Question
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. What is the difference between meiosis and mitosis?"
                      maxLength={2000}
                      className="bg-background text-foreground min-h-[80px] w-full resize-none rounded-base border-2 border-border p-3 font-base text-sm outline-none focus:ring-2 focus:ring-main"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Answer
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Meiosis produces four genetically diverse haploid cells; mitosis produces two identical diploid cells."
                      maxLength={5000}
                      className="bg-background text-foreground min-h-[120px] w-full resize-none rounded-base border-2 border-border p-3 font-base text-sm outline-none focus:ring-2 focus:ring-main"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mutationError && (
              <div className="rounded-base border-2 border-destructive bg-destructive/10 p-3">
                <p className="text-destructive text-center text-sm font-bold">
                  {mutationError}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-foreground text-background border-border h-10 rounded-base border-4 border-transparent px-6 font-black tracking-widest uppercase transition-colors hover:bg-main hover:text-main-foreground"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" /> Saving...
                  </span>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Add Card"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};