"use client";

import React, { useState } from "react";
import { DeckList } from "./deck-list";
import { StudySession } from "./study-session";
import { DeckManager } from "./deck-manager";
import { ScrollArea } from "@/components/ui/scroll-area";

type View =
  | { type: "list" }
  | { type: "cards"; deckId: string }
  | { type: "study"; deckId: string; backTo: "list" | "cards" };

const FlashcardsTab = () => {
  const [view, setView] = useState<View>({ type: "list" });

  return (
    <ScrollArea className="size-full bg-background">
      {view.type === "study" ? (
        <StudySession
          deckId={view.deckId}
          onFinish={() =>
            setView(
              view.backTo === "cards"
                ? { type: "cards", deckId: view.deckId }
                : { type: "list" },
            )
          }
        />
      ) : view.type === "cards" ? (
        <DeckManager
          deckId={view.deckId}
          onBack={() => setView({ type: "list" })}
          onStudy={() => setView({ type: "study", deckId: view.deckId, backTo: "cards" })}
        />
      ) : (
        <DeckList
          onSelectDeck={(deckId) =>
            setView({ type: "study", deckId, backTo: "list" })
          }
          onManageDeck={(deckId) => setView({ type: "cards", deckId })}
        />
      )}
    </ScrollArea>
  );
};

export default FlashcardsTab;