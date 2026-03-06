import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { usePomodoroStore } from "@/store/pomodoro-store";

export const PomodoroSettings = ({ children }: { children: React.ReactNode }) => {
  const settings = usePomodoroStore((s) => s.settings);
  const updateSettings = usePomodoroStore((s) => s.updateSettings);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Timer Settings</DialogTitle>
          <DialogDescription>
            Customize your focus and break durations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between font-base text-sm">
              <Label htmlFor="pomo">Focus (min)</Label>
              <span className="text-muted-foreground">{settings.pomo / 60}</span>
            </div>
            <Slider
              id="pomo"
              min={15}
              max={60}
              step={5}
              value={[settings.pomo / 60]}
              onValueChange={([val]) => updateSettings({ pomo: (val || 0) * 60 })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-base text-sm">
              <Label htmlFor="short">Short Break (min)</Label>
              <span className="text-muted-foreground">{settings.short / 60}</span>
            </div>
            <Slider
              id="short"
              min={3}
              max={15}
              step={1}
              value={[settings.short / 60]}
              onValueChange={([val]) => updateSettings({ short: (val || 0) * 60 })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-base text-sm">
              <Label htmlFor="long">Long Break (min)</Label>
              <span className="text-muted-foreground">{settings.long / 60}</span>
            </div>
            <Slider
              id="long"
              min={15}
              max={45}
              step={5}
              value={[settings.long / 60]}
              onValueChange={([val]) => updateSettings({ long: (val || 0) * 60 })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-base text-sm">
              <Label htmlFor="sessions">Sessions before Long Break</Label>
              <span className="text-muted-foreground">{settings.sessionsBeforeLongBreak}</span>
            </div>
            <Slider
              id="sessions"
              min={2}
              max={8}
              step={1}
              value={[settings.sessionsBeforeLongBreak]}
              onValueChange={([val]) => updateSettings({ sessionsBeforeLongBreak: val || 0 })}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
