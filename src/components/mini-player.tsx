"use client";

import { usePlayerStore } from "@/store/play-store";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { PAGE_ROUTES } from "@/constants/page-routes";

export const MiniPlayer = () => {
  const {
    tracks,
    currentIndex,
    isPlaying,
    volume,
    isMuted,
    play,
    pause,
    next,
    prev,
    mute,
    setVolume,
  } = usePlayerStore();

  const pathname = usePathname();
  const currentTrack = tracks[currentIndex];

  if (!currentTrack || pathname === PAGE_ROUTES.HOME) return null;

  return (
    <div className="border-border bg-secondary-background shadow-shadow fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border-2 px-4 py-2.5">
      <div className="size-9 shrink-0 overflow-hidden">
        {currentTrack.cover ? (
          <Image
            src={currentTrack.cover}
            alt={currentTrack.title}
            width={36}
            height={36}
            className="size-full object-cover"
          />
        ) : (
          <div className="bg-muted size-full" />
        )}
      </div>

      <div className="max-w-36 min-w-0">
        <p className="text-foreground truncate text-xs font-bold leading-tight">
          {currentTrack.title}
        </p>
        <p className="text-muted-foreground truncate text-[11px] leading-tight">
          {currentTrack.artist}
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="size-7 border-0 shadow-none"
            onDoubleClick={(e) => {
              e.stopPropagation();
              mute();
            }}
          >
            {isMuted ? (
              <VolumeX className="size-3.5" />
            ) : (
              <Volume2 className="size-3.5" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-secondary-background w-32 p-3" side="top">
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={([val]) => setVolume(val! / 100)}
          />
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="neutral"
          size="icon"
          onClick={prev}
          className="size-7 border-0 shadow-none"
        >
          <SkipBack className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={isPlaying ? pause : play}
          className="size-7"
        >
          {isPlaying ? (
            <Pause className="size-3" />
          ) : (
            <Play className="size-3" />
          )}
        </Button>

        <Button
          type="button"
          variant="neutral"
          size="icon"
          onClick={next}
          className="size-7 border-0 shadow-none"
        >
          <SkipForward className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
