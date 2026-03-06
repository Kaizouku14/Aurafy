import React from "react";
import { MODES, type Mode } from "@/constants/pomodoro-modes";
import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { RotateCcw, Pause, Play, Maximize, Minimize } from "lucide-react";
import { MiniPlayer } from "@/components/mini-player";

const TimerDisplay = ({
  mode,
  customDurations,
}: {
  mode: Mode;
  customDurations: Record<Mode, number>;
}) => {
  const duration = customDurations[mode];
  const [timeLeft, setTimeLeft] = React.useState(duration);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setTimeLeft(duration);
    setIsRunning(false);
  }, [duration]);

  React.useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

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
        "bg-background flex h-full flex-col items-center gap-8 py-8",
        isFullscreen && "size-screen justify-center",
      )}
    >
      <div className="text-foreground text-9xl font-bold tabular-nums">
        {formatTime(timeLeft * 1000)}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="neutral"
          size="icon"
          onClick={handleReset}
          className="size-10"
        >
          <RotateCcw className="size-4" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={() => setIsRunning((r) => !r)}
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
