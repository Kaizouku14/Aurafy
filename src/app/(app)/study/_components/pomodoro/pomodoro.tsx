import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimerDisplay from "./timer-display";
import React, { useCallback } from "react";
import { type Mode } from "@/constants/pomodoro-modes";
import { usePomodoroStore } from "@/store/pomodoro-store";

const POMODORO_MODES = [
  { value: "pomo", label: "Pomodoro", shortLabel: "Work" },
  { value: "short", label: "Short Break", shortLabel: "Short" },
  { value: "long", label: "Long Break", shortLabel: "Long" },
] as const;

const PomodoroTab = () => {
  const { setMode } = usePomodoroStore();

  const handleModeChange = useCallback(
    (value: string) => {
      setMode(value as Mode);
    },
    [setMode],
  );

  return (
    <Tabs
      defaultValue="pomo"
      onValueChange={handleModeChange}
      className="flex h-full w-full flex-col items-center justify-center gap-8 px-4 py-8 sm:px-6 md:px-8"
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-2">
          <TabsList className="border-border bg-secondary-background gap-2 border-2 p-1.5">
            {POMODORO_MODES.map(({ value, label, shortLabel }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="bg-secondary-background text-muted-foreground rounded-lg px-2 py-2 text-xs font-semibold sm:text-sm"
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="inline sm:hidden">{shortLabel}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        {POMODORO_MODES.map(({ value }) => (
          <TabsContent
            key={value}
            value={value}
            className="data-[state=active]:animate-in data-[state=active]:fade-in mt-0 w-full"
          >
            <TimerDisplay mode={value as Mode} />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default PomodoroTab;
