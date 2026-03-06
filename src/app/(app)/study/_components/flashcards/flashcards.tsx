"use client";

import React, { useState } from "react";
import { DeckList } from "./deck-list";
import { StudySession } from "./study-session";

const FlashcardsTab = () => {
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  const handleFinishSession = () => {
    setActiveDeckId(null);
  };

  return (
    <div className="h-full w-full bg-background overflow-y-auto">
      {activeDeckId ? (
        <StudySession deckId={activeDeckId} onFinish={handleFinishSession} />
      ) : (
        <DeckList onSelectDeck={(deckId) => setActiveDeckId(deckId)} />
      )}
    </div>
  );
};

export default FlashcardsTab;
