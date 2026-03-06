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
        "flex h-full w-full flex-col items-center justify-center gap-6",
        isFullscreen && "size-screen bg-background",
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="text-foreground text-[clamp(5rem,14vw,18rem)] leading-none font-bold tabular-nums">
            {formatTime(timeLeft * 1000)}
          </div>
        </div>

        <p className="text-muted-foreground text-sm font-medium tracking-wide">
          {isRunning
            ? "Stay focused..."
            : timeLeft === duration
              ? "Ready to start"
              : "Paused"}
        </p>
      </div>

      {/* Controls Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="neutral"
          size="icon"
          onClick={reset}
          className="border-border hover:bg-secondary-background size-11 rounded-lg border-2 transition-all"
          title="Reset timer"
        >
          <RotateCcw className="size-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={isRunning ? pause : start}
          className="flex size-16 items-center justify-center rounded-full"
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? (
            <Pause className="size-7" />
          ) : (
            <Play className="size-7" />
          )}
        </Button>

        <Button
          variant="neutral"
          size="icon"
          onClick={toggleFullscreen}
          className="border-border hover:bg-secondary-background size-11 rounded-lg border-2 transition-all"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="size-5" />
          ) : (
            <Maximize className="size-5" />
          )}
        </Button>
      </div>

      {isFullscreen && <MiniPlayer />}
    </div>
  );
};
export default TimerDisplay;
