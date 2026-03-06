import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimerDisplay from "./timer-display";
import React from "react";
import { DEFAULT_DURATIONS, type Mode } from "@/constants/pomodoro-modes";
import { usePomodoroStore } from "@/store/pomodoro-store";

const PomodoroTab = () => {
  const { setMode } = usePomodoroStore();
  const [settingsInput, setSettingsInput] = React.useState({
    pomo: String(DEFAULT_DURATIONS.pomo / 60),
    short: String(DEFAULT_DURATIONS.short / 60),
    long: String(DEFAULT_DURATIONS.long / 60),
  });

  return (
    <Tabs
      defaultValue="pomo"
      orientation="vertical"
      onValueChange={(v) => setMode(v as Mode)}
      className="flex flex-col items-center py-4"
    >
      <TabsList className="text-semibold border-none">
        <TabsTrigger value="pomo">Pomodoro</TabsTrigger>
        <TabsTrigger value="short">Short Break</TabsTrigger>
        <TabsTrigger value="long">Long Break</TabsTrigger>
      </TabsList>
      <TabsContent value="pomo">
        <TimerDisplay mode="pomo" />
      </TabsContent>
      <TabsContent value="short">
        <TimerDisplay mode="short" />
      </TabsContent>
      <TabsContent value="long">
        <TimerDisplay mode="long" />
      </TabsContent>
    </Tabs>
  );
};

export default PomodoroTab;
