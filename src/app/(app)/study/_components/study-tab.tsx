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

const StudyTab = () => {
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
    <Tabs defaultValue="pomodoro" className="flex items-center">
      <TabsList className="flex h-auto flex-col gap-2 border-none p-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={tab.value}
                  className={cn(
                    "flex items-center justify-center rounded-lg border-2 p-4 transition-all [&_svg]:size-5",
                    "border-border shadow-shadow",
                    "bg-secondary-background text-foreground",
                    "hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none",
                  )}
                >
                  <Icon />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">{tab.description}</TooltipContent>
            </Tooltip>
          );
        })}
      </TabsList>

      <TabsContent value="pomodoro" className="mt-0">
        <PomodoroTab />
      </TabsContent>
      <TabsContent value="flashcards" className="mt-0">
        <div>Flashcards here.</div>
      </TabsContent>
      <TabsContent value="listcheck" className="mt-0" />
    </Tabs>
  );
};

export default StudyTab;
