"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuizList } from "./quiz-list";
import { QuizSession } from "./quiz-session";

const QuizTab = () => {
  const [activeQuizSetId, setActiveQuizSetId] = useState<string | null>(null);

  return (
    <ScrollArea className="size-full bg-background">
      {activeQuizSetId ? (
        <QuizSession
          quizSetId={activeQuizSetId}
          onFinish={() => setActiveQuizSetId(null)}
        />
      ) : (
        <QuizList onSelectQuiz={(quizSetId) => setActiveQuizSetId(quizSetId)} />
      )}
    </ScrollArea>
  );
};

export default QuizTab;
