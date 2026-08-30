"use client";

import React, { useState, useCallback, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Loading } from "../shared/loading";

export const NoteEditor = ({
  noteId,
  onBack,
}: {
  noteId: string;
  onBack: () => void;
}) => {
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
      void utils.notes.getNotes.invalidate();
    },
  });

  const handleSave = useCallback(() => {
    if (!hasChanges) return;
    updateNote.mutate({ noteId, cues, notes, summary });
  }, [noteId, cues, notes, summary, hasChanges, updateNote]);

  const handleChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setter(e.target.value);
      setHasChanges(true);
    };
  };

  if (isLoading) {
    return <Loading text="Note" />;
  }

  if (!note) return null;

  return (
    <div className="animate-fade-enter mx-auto flex size-full max-w-6xl flex-col p-3 sm:p-4 md:p-6">
      <div className="border-border mb-4 flex flex-col gap-3 border-b-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Button
            onClick={() => {
              handleSave();
              onBack();
            }}
            variant="noShadow"
            className="border-border bg-secondary-background hover:bg-background text-foreground shrink-0 gap-1.5 border-2 px-3 py-1.5 font-bold transition-colors"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          <h2 className="truncate text-lg font-black tracking-tight uppercase sm:text-2xl">
            {note.subject}
          </h2>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateNote.isPending}
          className="border-border bg-foreground text-background hover:bg-main hover:text-main-foreground w-full shrink-0 gap-1.5 border-2 px-3 font-bold transition-colors sm:w-auto sm:px-4"
        >
          {updateNote.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {hasChanges ? "Save" : "Saved"}
        </Button>
      </div>

      <div className="border-border rounded-base bg-secondary-background flex min-h-0 flex-1 flex-col gap-0 overflow-hidden border-4">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="border-border flex min-h-30 flex-col border-b-4 md:min-h-0 md:w-1/3 md:border-r-4 md:border-b-0">
            <div className="bg-foreground text-background px-4 py-2">
              <span className="text-xs font-black tracking-widest uppercase">
                Cues / Questions
              </span>
            </div>
            <Textarea
              value={cues}
              onChange={handleChange(setCues)}
              onBlur={handleSave}
              placeholder="Key terms, questions, or prompts to test yourself..."
              className="font-base flex-1 resize-none rounded-none border-none bg-transparent p-4 text-sm focus-visible:ring-0"
            />
          </div>
          <div className="flex min-h-30 flex-1 flex-col md:min-h-0">
            <div className="bg-foreground text-background px-4 py-2">
              <span className="text-xs font-black tracking-widest uppercase">
                Notes
              </span>
            </div>
            <Textarea
              value={notes}
              onChange={handleChange(setNotes)}
              onBlur={handleSave}
              placeholder="Main lecture notes, explanations, diagrams..."
              className="font-base flex-1 resize-none rounded-none border-none bg-transparent p-4 text-sm focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="border-border border-t-4">
          <div className="bg-foreground text-background px-4 py-2">
            <span className="text-xs font-black tracking-widest uppercase">
              Summary
            </span>
          </div>
          <Textarea
            value={summary}
            onChange={handleChange(setSummary)}
            onBlur={handleSave}
            placeholder="Summarize the key takeaways in your own words..."
            className="font-base min-h-50 w-full rounded-none border-none bg-transparent p-4 text-sm focus-visible:ring-0"
          />
        </div>
      </div>
    </div>
  );
};
