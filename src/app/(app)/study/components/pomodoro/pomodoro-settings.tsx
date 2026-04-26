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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PomodoroSettings = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const settings = usePomodoroStore((s) => s.settings);
  const updateSettings = usePomodoroStore((s) => s.updateSettings);

  const handleInput = (key: keyof typeof settings, value: string) => {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateSettings({
        [key]: key === "sessionsBeforeLongBreak" ? parsed : parsed * 60,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border gap-6 border-4 p-6 sm:max-w-100">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-center text-xl font-black tracking-widest uppercase">
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="border-border rounded-base bg-background space-y-4 border-4 p-4 shadow-sm">
            <h3 className="text-center text-sm font-bold tracking-wider uppercase">
              Durations (Mins)
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2">
                <Label
                  htmlFor="pomo"
                  className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase"
                >
                  Focus
                </Label>
                <Input
                  id="pomo"
                  type="number"
                  min={1}
                  className="border-border rounded-base focus:ring-main focus:border-main bg-background w-full border-2 p-2 text-center text-lg font-bold focus:ring-2 focus:outline-none"
                  defaultValue={settings.pomo / 60}
                  onBlur={(e) => handleInput("pomo", e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Label
                  htmlFor="short"
                  className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase"
                >
                  Short
                </Label>
                <Input
                  id="short"
                  type="number"
                  min={1}
                  className="border-border rounded-base focus:ring-main focus:border-main bg-background w-full border-2 p-2 text-center text-lg font-bold focus:ring-2 focus:outline-none"
                  defaultValue={settings.short / 60}
                  onBlur={(e) => handleInput("short", e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Label
                  htmlFor="long"
                  className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase"
                >
                  Long
                </Label>
                <Input
                  id="long"
                  type="number"
                  min={1}
                  className="border-border rounded-base focus:ring-main focus:border-main bg-background w-full border-2 p-2 text-center text-lg font-bold focus:ring-2 focus:outline-none"
                  defaultValue={settings.long / 60}
                  onBlur={(e) => handleInput("long", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-border rounded-base bg-background space-y-4 border-4 p-4 shadow-sm">
            <h3 className="text-center text-sm font-bold tracking-wider uppercase">
              Cycle Configuration
            </h3>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="sessions"
                className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
              >
                Sessions before Long Break
              </Label>
              <Input
                id="sessions"
                type="number"
                min={1}
                className="border-border rounded-base focus:ring-main focus:border-main bg-background w-16 border-2 p-2 text-center text-lg font-bold focus:ring-2 focus:outline-none"
                defaultValue={settings.sessionsBeforeLongBreak}
                onBlur={(e) =>
                  handleInput("sessionsBeforeLongBreak", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <DialogClose asChild>
          <Button className="bg-foreground text-background rounded-base hover:bg-main hover:text-main-foreground mt-4 w-full border-4 border-transparent p-4 text-lg font-black tracking-widest uppercase transition-colors duration-200">
            Save & Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
