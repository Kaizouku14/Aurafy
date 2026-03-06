"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Timer, NotebookPen, CalendarCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PomodoroTab from "./pomodoro/pomodoro";
import FlashcardsTab from "./flashcards/flashcards";
import React from "react";

const STUDY_TABS = [
  {
    value: "pomodoro",
    icon: Timer,
    label: "Pomodoro",
    description: "Focus timer for deep work sessions",
  },
  {
    value: "flashcards",
    icon: NotebookPen,
    label: "Flashcards",
    description: "Learn and practice with flashcards",
  },
  {
    value: "listcheck",
    icon: CalendarCheck2,
    label: "Tasks",
    description: "Manage your study tasks",
  },
];

const StudyTab = () => {
  const [selected, setSelected] = React.useState("pomodoro");

  return (
    <Tabs
      defaultValue="pomodoro"
      onValueChange={(value) => setSelected(value)}
      className="flex h-[calc(100vh-4.5rem)] w-full"
    >
      <aside className="border-border bg-secondary-background flex w-16 shrink-0 flex-col border-r-2 py-4">
        <TabsList className="flex h-auto w-full flex-col gap-1.5 border-none bg-transparent p-0 px-2">
          {STUDY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selected === tab.value;
            return (
              <Tooltip key={tab.value}>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={tab.value}
                    className={cn(
                      "group relative flex w-full items-center justify-center border-2 p-2.5 transition-all duration-150",
                      isActive
                        ? "bg-main text-main-foreground border-border shadow-shadow"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background",
                    )}
                    aria-label={tab.label}
                  >
                    <Icon className="size-4.5" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TabsList>
      </aside>

      <main className="border-border flex flex-1 flex-col overflow-hidden border-l-0">
        {STUDY_TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:animate-in data-[state=active]:fade-in mt-0 h-full flex-1"
          >
            {tab.value === "pomodoro" && <PomodoroTab />}
            {tab.value === "flashcards" && <FlashcardsTab />}
            {tab.value === "listcheck" && (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                Task manager coming soon
              </div>
            )}
          </TabsContent>
        ))}
      </main>
    </Tabs>
  );
};

export default StudyTab;
