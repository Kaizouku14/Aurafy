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
    <div className="border-border bg-secondary-background shadow-shadow fixed -right-35 bottom-4 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-3 py-2">
      <div className="size-10 shrink-0 overflow-hidden rounded-md">
        {currentTrack.cover ? (
          <Image
            src={currentTrack.cover}
            alt={currentTrack.title}
            width={40}
            height={40}
            className="size-full object-cover"
          />
        ) : (
          <div className="bg-muted size-full" />
        )}
      </div>

      <div className="max-w-35 min-w-0">
        <p className="text-foreground truncate text-sm leading-tight font-bold">
          {currentTrack.title}
        </p>
        <p className="text-muted-foreground truncate text-xs leading-tight">
          {currentTrack.artist}
        </p>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="size-8 disabled:opacity-40"
            onDoubleClick={(e) => {
              e.stopPropagation();
              mute();
            }}
          >
            {isMuted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-secondary-background w-34 p-3" side="top">
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
          className="size-8"
        >
          <SkipBack className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={isPlaying ? pause : play}
          className="size-8 rounded-full"
        >
          {isPlaying ? (
            <Pause className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>

        <Button
          type="button"
          variant="neutral"
          size="icon"
          onClick={next}
          className="size-8"
        >
          <SkipForward className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
