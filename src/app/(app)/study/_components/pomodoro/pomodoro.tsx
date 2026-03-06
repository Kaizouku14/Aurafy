import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimerDisplay from "./timer-display";
import React, { useCallback } from "react";
import { type Mode } from "@/constants/pomodoro-modes";
import { usePomodoroStore } from "@/store/pomodoro-store";
import { cn } from "@/lib/utils";

const POMODORO_MODES = [
  { value: "pomo", label: "Focus", shortLabel: "Focus" },
  { value: "short", label: "Short Break", shortLabel: "Short" },
  { value: "long", label: "Long Break", shortLabel: "Long" },
] as const;

const PomodoroTab = () => {
  const { setMode } = usePomodoroStore();
  const [selected, setSelected] = React.useState("pomo");

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value as Mode);
      setSelected(value);
    },
    [setMode],
  );

  return (
    <Tabs
      defaultValue="pomo"
      onValueChange={handleModeChange}
      className="flex h-full w-full flex-col"
    >
      {/* Mode tabs */}
      <div className="border-border border-b-2 px-6 pt-5 pb-0">
        <TabsList className="h-auto gap-0 border-none bg-transparent p-0">
          {POMODORO_MODES.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "border-b-2 border-b-transparent px-4 pb-3 pt-1 text-xs font-semibold tracking-wide transition-colors",
                "text-muted-foreground hover:text-foreground",
                "data-[state=active]:text-main data-[state=active]:border-b-main",
                "rounded-none bg-transparent shadow-none",
              )}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Timer content */}
      <div className="flex flex-1 items-center justify-center">
        {POMODORO_MODES.map(({ value }) => (
          <TabsContent
            key={value}
            value={value}
            className="data-[state=active]:animate-in data-[state=active]:fade-in mt-0 h-full w-full"
          >
            <TimerDisplay mode={value as Mode} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default PomodoroTab;
