import React from "react";
import { MODES, type Mode } from "@/constants/pomodoro-modes";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { RotateCcw, Pause, Play, Maximize, Minimize } from "lucide-react";
import { MiniPlayer } from "@/components/mini-player";
import { usePomodoroStore } from "@/store/pomodoro-store";

const TimerDisplay = ({ mode }: { mode: Mode }) => {
  const { timeLeft, isRunning, customDurations, start, pause, reset } =
    usePomodoroStore();

  const duration = customDurations[mode];
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full flex-col items-center justify-center gap-8 py-8",
        isFullscreen && "size-screen bg-background",
      )}
    >
      <div className="text-[clamp(6rem,12vw,16rem)] font-bold tabular-nums">
        {formatTime(timeLeft * 1000)}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="neutral"
          size="icon"
          onClick={reset}
          className="size-10"
        >
          <RotateCcw className="size-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={isRunning ? pause : start}
          className="flex size-14 items-center justify-center rounded-full"
        >
          {isRunning ? (
            <Pause className="size-6" />
          ) : (
            <Play className="size-6" />
          )}
        </Button>

        <Button
          variant="neutral"
          size="icon"
          onClick={toggleFullscreen}
          className="size-10"
        >
          {isFullscreen ? (
            <Minimize className="size-4" />
          ) : (
            <Maximize className="size-4" />
          )}
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        {isRunning
          ? "Stay focused..."
          : timeLeft === duration
            ? "Ready to start"
            : "Paused"}
      </p>
      {isFullscreen && <MiniPlayer />}
    </div>
  );
};
export default TimerDisplay;
