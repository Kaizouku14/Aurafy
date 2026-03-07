"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Trash2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StaggerList } from "@/components/animation/stagger-list";

export const NoteList = ({ onSelectNote }: { onSelectNote: (noteId: string) => void }) => {
  const { data: notes, isLoading } = api.notes.getNotes.useQuery();
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");

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
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    createNote.mutate({ subject: subject.trim() });
  };

  return (
    <div className="flex flex-col size-full max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-border pb-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Cornell Notes</h2>
          <p className="text-muted-foreground font-base mt-2">Structured notes with cues, notes, and summaries.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="border-2 border-border gap-2 font-bold px-4 py-2">
              <Plus className="size-4" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] border-4 border-border p-6 bg-secondary-background">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-widest text-foreground">New Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <Input
                placeholder="Subject or topic name"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-2 border-border bg-background text-foreground font-bold"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!subject.trim() || createNote.isPending}
                className="w-full bg-foreground text-background font-black uppercase tracking-widest border-4 border-transparent hover:bg-main hover:text-main-foreground transition-colors"
              >
                {createNote.isPending ? <Loader2 className="animate-spin size-4" /> : "Create Note"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <p className="animate-pulse font-bold text-lg uppercase tracking-widest text-muted-foreground">Loading notes...</p>
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-border rounded-base bg-secondary-background/50 p-12 text-center">
          <FileText className="size-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold uppercase mb-2">No Notes Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md font-base">
            Use the Cornell method to organize your lecture notes with cues, detailed notes, and summaries.
          </p>
          <Button onClick={() => setOpen(true)} className="bg-main text-main-foreground hover:bg-main/90 font-bold gap-2">
            <Plus className="size-4" /> Create Your First Note
          </Button>
        </div>
      ) : (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20" itemDistance={20} staggerDelay={0.08}>
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className="group relative flex flex-col border-4 border-border rounded-base bg-secondary-background p-5 shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer"
            >
              <Button
                variant="noShadow"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote.mutate({ noteId: note.id });
                }}
                disabled={deleteNote.isPending}
                className="absolute top-3 right-3 rounded-base border-2 border-transparent text-main-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-all md:opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </Button>

              <h3 className="font-black text-xl leading-tight line-clamp-2 pr-8 mb-3">{note.subject}</h3>
              {note.notes && (
                <p className="text-sm text-muted-foreground line-clamp-3 font-base mb-4">{note.notes}</p>
              )}
              <div className="mt-auto text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </StaggerList>
      )}
    </div>
  );
};
