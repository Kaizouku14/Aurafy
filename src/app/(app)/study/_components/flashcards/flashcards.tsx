"use client";

import React, { useState } from "react";
import { DeckList } from "./deck-list";
import { StudySession } from "./study-session";
import { ScrollArea } from "@/components/ui/scroll-area";

const FlashcardsTab = () => {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const handleFinishSession = () => {
    setActiveDeckId(null);
  };

  return (
    <ScrollArea className="size-full bg-background">
      {activeDeckId ? (
        <StudySession deckId={activeDeckId} onFinish={handleFinishSession} />
      ) : (
        <DeckList onSelectDeck={(deckId) => setActiveDeckId(deckId)} />
      )}
    </ScrollArea>
  );
};

export default FlashcardsTab;
