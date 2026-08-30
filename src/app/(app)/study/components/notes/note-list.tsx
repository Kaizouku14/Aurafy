"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Trash2, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StaggerList } from "@/components/animation/stagger-list";
import { ListSection } from "../shared/list-section";
import { ConfirmDeleteDialog } from "../shared/confirm-delete-dialog";
import { useConfirmDelete } from "../shared/use-confirm-delete";
import { sileo } from "sileo";

const NoteDate = ({ date }: { date: Date | string }) => {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString());
  }, [date]);

  return formatted;
};

export const NoteList = ({
  onSelectNote,
}: {
  onSelectNote: (noteId: string) => void;
}) => {
  const { data: notes, isLoading } = api.notes.getNotes.useQuery();
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const { pendingId, isOpen, openConfirm, closeConfirm } = useConfirmDelete();

  const createNote = api.notes.createNote.useMutation({
    onSuccess: (data) => {
      void utils.notes.getNotes.invalidate();
      setOpen(false);
      setSubject("");
      onSelectNote(data.noteId);
    },
  });

  const deleteNote = api.notes.deleteNote.useMutation({
    onSuccess: () => {
      void utils.notes.getNotes.invalidate();
    },
    onError: () => {
      sileo.error({
        title: "Failed to delete note",
        description: "Please try again.",
      });
    },
  });

  const pendingNote = notes?.find((note) => note.id === pendingId) ?? null;

  const confirmDeleteNote = async () => {
    if (!pendingId || deleteNote.isPending) return;

    try {
      await deleteNote.mutateAsync({ noteId: pendingId });
      closeConfirm();
    } catch {
      // handled in mutation onError
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    createNote.mutate({ subject: subject.trim() });
  };

  return (
    <>
      <ListSection
        title="Cornell Notes"
        description="Structured notes with cues, notes, and summaries."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="border-border gap-2 border-2 px-4 py-2 font-bold">
                <Plus className="size-4" /> New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-secondary-background border-4 p-6 sm:max-w-100">
              <DialogHeader>
                <DialogTitle className="text-foreground text-xl font-black tracking-widest uppercase">
                  New Note
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <Input
                  placeholder="Subject or topic name"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="border-border bg-background text-foreground border-2 font-bold"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!subject.trim() || createNote.isPending}
                  className="bg-foreground text-background hover:bg-main hover:text-main-foreground w-full border-4 border-transparent font-black tracking-widest uppercase transition-colors"
                >
                  {createNote.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Create Note"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
        isLoading={isLoading}
        loadingLabel="Loading notes..."
        isEmpty={!notes || notes.length === 0}
        emptyState={
          <div className="border-border rounded-base bg-secondary-background/50 flex flex-1 flex-col items-center justify-center border-4 border-dashed p-12 text-center">
            <FileText className="text-muted-foreground mb-4 size-16" />
            <h3 className="mb-2 text-xl font-bold uppercase">No Notes Yet</h3>
            <p className="text-muted-foreground font-base mb-6 max-w-md">
              Use the Cornell method to organize your lecture notes with cues,
              detailed notes, and summaries.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-main text-main-foreground hover:bg-main/90 gap-2 font-bold"
            >
              <Plus className="size-4" /> Create Your First Note
            </Button>
          </div>
        }
      >
        <StaggerList
          className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3"
          itemDistance={20}
          staggerDelay={0.08}
        >
          {notes?.map((note) => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectNote(note.id)}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectNote(note.id);
                }
              }}
              className="group border-border rounded-base bg-secondary-background shadow-shadow relative flex cursor-pointer flex-col border-4 p-5 transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <Button
                variant="noShadow"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openConfirm(note.id);
                }}
                disabled={deleteNote.isPending}
                className="rounded-base text-destructive hover:border-destructive hover:bg-destructive/10 absolute top-3 right-3 cursor-pointer border-2 border-transparent bg-transparent transition-opacity group-hover:opacity-100 md:opacity-0"
              >
                <Trash2 className="size-4" />
              </Button>

              <h3 className="mb-3 line-clamp-2 pr-8 text-xl leading-tight font-black">
                {note.subject}
              </h3>
              {note.notes && (
                <p className="text-muted-foreground font-base mb-4 line-clamp-3 text-sm">
                  {note.notes}
                </p>
              )}
              <div className="text-muted-foreground mt-auto text-xs font-bold tracking-wider uppercase">
                <NoteDate date={note.updatedAt} />
              </div>
            </div>
          ))}
        </StaggerList>
      </ListSection>

      <ConfirmDeleteDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !deleteNote.isPending) closeConfirm();
        }}
        title="Delete note?"
        message={
          pendingNote
            ? `This will permanently delete "${pendingNote.subject}".`
            : "This will permanently delete this note."
        }
        isPending={deleteNote.isPending}
        onConfirm={() => {
          void confirmDeleteNote();
        }}
      />
    </>
  );
};
