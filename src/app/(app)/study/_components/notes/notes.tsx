"use client";

import React, { useState } from "react";
import { NoteList } from "./note-list";
import { NoteEditor } from "./note-editor";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotesTab = () => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  return (
    <ScrollArea className="size-full bg-background">
      {activeNoteId ? (
        <NoteEditor noteId={activeNoteId} onBack={() => setActiveNoteId(null)} />
      ) : (
        <NoteList onSelectNote={(noteId) => setActiveNoteId(noteId)} />
      )}
    </ScrollArea>
  );
};

export default NotesTab;
