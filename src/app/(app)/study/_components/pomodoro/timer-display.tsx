import React from "react";
import { MODES, type Mode } from "@/constants/pomodoro-modes";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import {
  RotateCcw,
  Pause,
  Play,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";
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

  const statusLabel = isRunning
    ? "Stay focused"
    : timeLeft === duration
      ? "Ready to start"
      : "Paused";

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center",
        isFullscreen && "size-screen bg-background",
      )}
    >
      {/* Timer */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-foreground text-[clamp(5rem,14vw,18rem)] leading-none font-bold tabular-nums">
          {formatTime(timeLeft * 1000)}
        </div>
        <p
          className={cn(
            "text-xs font-semibold tracking-[0.15em] uppercase transition-colors",
            isRunning ? "text-main" : "text-muted-foreground",
          )}
        >
          {statusLabel}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center gap-3">
        {/* Left: Reset */}
        <Button
          variant="neutral"
          size="icon"
          onClick={reset}
          className="border-border size-10 border-2"
          title="Reset"
        >
          <RotateCcw className="size-4" />
        </Button>

        {/* Center: Play/Pause — larger focal point */}
        <Button
          variant="default"
          size="icon"
          onClick={isRunning ? pause : start}
          className="border-border shadow-shadow size-16 border-2"
          title={isRunning ? "Pause" : "Start"}
        >
          {isRunning ? (
            <Pause className="size-6" />
          ) : (
            <Play className="size-6" />
          )}
        </Button>

        {/* Right: Settings + Fullscreen */}
        <div className="flex items-center gap-2">
          <Button
            variant="neutral"
            size="icon"
            className="border-border size-10 border-2"
            title="Settings"
          >
            <Settings className="size-4" />
          </Button>

          <Button
            variant="neutral"
            size="icon"
            onClick={toggleFullscreen}
            className="border-border size-10 border-2"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="size-4" />
            ) : (
              <Maximize className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {isFullscreen && <MiniPlayer />}
    </div>
  );
};

export default TimerDisplay;
