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
      className="bg-background flex w-full flex-col md:flex-row"
    >
      <aside
        className={cn(
          "flex items-center justify-center px-3 py-4",
          "bg-secondary-background md:h-full md:w-20 md:flex-col md:justify-start md:px-2 md:py-6",
        )}
      >
        <nav className="flex gap-2 md:w-full md:flex-col md:gap-3">
          <TabsList className="flex h-auto gap-2 border-none bg-transparent p-0 md:w-full md:flex-col">
            {STUDY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selected === tab.value;
              return (
                <Tooltip key={tab.value}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={tab.value}
                      className={cn(
                        "group relative flex items-center justify-center rounded-lg border-2 p-3",
                        "transition-all duration-200 ease-out [&_svg]:size-5",
                        "border-border bg-background text-muted-foreground",
                        isActive && "bg-main text-main-foreground",
                      )}
                      aria-label={tab.label}
                    >
                      <Icon />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="hidden text-xs md:block"
                  >
                    {tab.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TabsList>
        </nav>
      </aside>

      <main className="border-border flex flex-1 flex-col overflow-hidden">
        {STUDY_TABS.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:animate-in data-[state=active]:fade-in mt-0 flex-1"
          >
            {tab.value === "pomodoro" && <PomodoroTab />}
            {tab.value === "flashcards" && "flashcards"}
            {tab.value === "listcheck" && "Task Manager"}
          </TabsContent>
        ))}
      </main>
    </Tabs>
  );
};

export default StudyTab;
