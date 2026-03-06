"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Timer, NotebookPen, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PomodoroTab from "./pomodoro/pomodoro-tab";

const StudyTab = () => {
  const [active, setActive] = useState("pomodoro");

  const tabs = [
    { value: "pomodoro", icon: Timer, description: "Pomodoro timer" },
    {
      value: "flashcards",
      icon: NotebookPen,
      description: "Flashcards practice",
    },
    { value: "listcheck", icon: CalendarCheck2, description: "Task planner" },
  ];

  return (
    <div className="flex size-full items-center gap-4">
      <div className="flex h-auto flex-col gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.value;
          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "neutral"}
                  onClick={() => setActive(tab.value)}
                  className="p-4 [&_svg]:size-5"
                >
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{tab.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="h-full flex-1">
        {active === "pomodoro" && <PomodoroTab />}
        {active === "flashcards" && <div>Flashcards here.</div>}
        {active === "listcheck" && <div></div>}
      </div>
    </div>
  );
};

export default StudyTab;
