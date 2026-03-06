import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimerDisplay from "./timer-display";
import React from "react";
import { DEFAULT_DURATIONS, type Mode } from "@/constants/pomodoro-modes";

const PomodoroTab = () => {
  const [customDurations, setCustomDurations] =
    React.useState<Record<Mode, number>>(DEFAULT_DURATIONS);
  const [settingsInput, setSettingsInput] = React.useState({
    pomo: String(DEFAULT_DURATIONS.pomo / 60),
    short: String(DEFAULT_DURATIONS.short / 60),
    long: String(DEFAULT_DURATIONS.long / 60),
  });

  return (
    <Tabs
      defaultValue="pomo"
      orientation="vertical"
      className="flex flex-col items-center py-4"
    >
      <TabsList>
        <TabsTrigger value="pomo">Pomodoro</TabsTrigger>
        <TabsTrigger value="short">Short Break</TabsTrigger>
        <TabsTrigger value="long">Long Break</TabsTrigger>
      </TabsList>
      <TabsContent value="pomo">
        <TimerDisplay mode="pomo" customDurations={customDurations} />
      </TabsContent>
      <TabsContent value="short">
        <TimerDisplay mode="short" customDurations={customDurations} />
      </TabsContent>
      <TabsContent value="long">
        <TimerDisplay mode="long" customDurations={customDurations} />
      </TabsContent>
    </Tabs>
  );
};

export default PomodoroTab;
