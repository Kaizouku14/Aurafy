import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePomodoroStore } from "@/store/pomodoro-store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PomodoroSettings = ({ children }: { children: React.ReactNode }) => {
  const settings = usePomodoroStore((s) => s.settings);
  const updateSettings = usePomodoroStore((s) => s.updateSettings);

  const handleInput = (key: keyof typeof settings, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateSettings({ [key]: key === "sessionsBeforeLongBreak" ? parsed : parsed * 60 });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] border-4 border-border p-6 gap-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-center text-xl font-black uppercase tracking-widest">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="border-4 border-border rounded-base p-4 bg-background shadow-sm space-y-4">
            <h3 className="text-center font-bold text-sm uppercase tracking-wider">
              Durations (Mins)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="pomo" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Focus</Label>
                <Input
                  id="pomo"
                  type="number"
                  min={1}
                  className="w-full text-center font-bold text-lg p-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main focus:border-main bg-background"
                  defaultValue={settings.pomo / 60}
                  onBlur={(e) => handleInput("pomo", e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="short" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Short</Label>
                <Input
                  id="short"
                  type="number"
                  min={1}
                  className="w-full text-center font-bold text-lg p-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main focus:border-main bg-background"
                  defaultValue={settings.short / 60}
                  onBlur={(e) => handleInput("short", e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="long" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Long</Label>
                <Input
                  id="long"
                  type="number"
                  min={1}
                  className="w-full text-center font-bold text-lg p-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main focus:border-main bg-background"
                  defaultValue={settings.long / 60}
                  onBlur={(e) => handleInput("long", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-4 border-border rounded-base p-4 bg-background shadow-sm space-y-4">
            <h3 className="text-center font-bold text-sm uppercase tracking-wider">
              Cycle Configuration
            </h3>
            <div className="flex justify-between items-center">
              <Label htmlFor="sessions" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sessions before Long Break
              </Label>
              <Input
                id="sessions"
                type="number"
                min={1}
                className="w-16 text-center font-bold text-lg p-2 border-2 border-border rounded-base focus:outline-none focus:ring-2 focus:ring-main focus:border-main bg-background"
                defaultValue={settings.sessionsBeforeLongBreak}
                onBlur={(e) => handleInput("sessionsBeforeLongBreak", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogClose asChild>
          <Button className="w-full mt-4 bg-foreground text-background font-black uppercase tracking-widest text-lg p-4 rounded-base border-4 border-transparent hover:bg-main hover:text-main-foreground transition-colors duration-200">
            Save & Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
