"use client";

import React, { useState, useCallback, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export const NoteEditor = ({ noteId, onBack }: { noteId: string; onBack: () => void }) => {
  const { data: note, isLoading } = api.notes.getNote.useQuery({ noteId });
  const utils = api.useUtils();

  const [cues, setCues] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (note) {
      setCues(note.cues);
      setNotes(note.notes);
      setSummary(note.summary);
    }
  }, [note]);

  const updateNote = api.notes.updateNote.useMutation({
    onSuccess: () => {
      setHasChanges(false);
      utils.notes.getNotes.invalidate();
    },
  });

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    updateNote.mutate({ noteId, cues, notes, summary });
  }, [noteId, cues, notes, summary, hasChanges, updateNote]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setter(e.target.value);
      setHasChanges(true);
    };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <Loader2 className="animate-spin size-10 text-muted-foreground mb-4" />
        <h2 className="text-xl font-black uppercase tracking-widest text-muted-foreground">Loading Note...</h2>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="flex flex-col size-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b-4 border-border pb-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            onClick={() => { handleSave(); onBack(); }}
            variant="noShadow"
            className="border-2 border-border gap-1.5 font-bold px-3 py-1.5 bg-secondary-background hover:bg-background transition-colors text-foreground shrink-0"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight truncate">{note.subject}</h2>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateNote.isPending}
          className="border-2 border-border gap-1.5 font-bold px-3 sm:px-4 bg-foreground text-background hover:bg-main hover:text-main-foreground transition-colors shrink-0 w-full sm:w-auto"
        >
          {updateNote.isPending ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
          {hasChanges ? "Save" : "Saved"}
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-0 border-4 border-border rounded-base overflow-hidden bg-secondary-background min-h-0">
        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          <div className="md:w-1/3 border-b-4 md:border-b-0 md:border-r-4 border-border flex flex-col min-h-[120px] md:min-h-0">
            <div className="bg-foreground text-background px-4 py-2">
              <span className="text-xs font-black uppercase tracking-widest">Cues / Questions</span>
            </div>
            <Textarea
              value={cues}
              onChange={handleChange(setCues)}
              onBlur={handleSave}
              placeholder="Key terms, questions, or prompts to test yourself..."
              className="flex-1 resize-none border-none rounded-none bg-transparent focus-visible:ring-0 font-base text-sm p-4"
            />
          </div>
          <div className="flex-1 flex flex-col min-h-[120px] md:min-h-0">
            <div className="bg-foreground text-background px-4 py-2">
              <span className="text-xs font-black uppercase tracking-widest">Notes</span>
            </div>
            <Textarea
              value={notes}
              onChange={handleChange(setNotes)}
              onBlur={handleSave}
              placeholder="Main lecture notes, explanations, diagrams..."
              className="flex-1 resize-none border-none rounded-none bg-transparent focus-visible:ring-0 font-base text-sm p-4"
            />
          </div>
        </div>

        <div className="border-t-4 border-border">
          <div className="bg-foreground text-background px-4 py-2">
            <span className="text-xs font-black uppercase tracking-widest">Summary</span>
          </div>
          <Textarea
            value={summary}
            onChange={handleChange(setSummary)}
            onBlur={handleSave}
            placeholder="Summarize the key takeaways in your own words..."
            className="w-full resize-none border-none rounded-none bg-transparent focus-visible:ring-0 font-base text-sm p-4 min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};
