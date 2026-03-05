"use client";

import { Button } from "@/components/ui/button";
import { cn, formatTime } from "@/lib/utils";
import { usePlayerStore } from "@/store/play-store";
import type { SpotifyTrack } from "@/types/spotify";
import { Music, Pause, Play } from "lucide-react";
import Image from "next/image";

interface MusicCardProps {
  index: number;
  track: SpotifyTrack;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const MusicCard: React.FC<MusicCardProps> = ({
  index,
  track,
  selectedIndex,
  setSelectedIndex,
}) => {
  const { isPlaying, play, pause } = usePlayerStore();
  const isSelected = selectedIndex === index;

  const handleClick = () => {
    setSelectedIndex(index);

    if (isSelected) {
      isPlaying ? pause() : play();
      return;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "rounded-base flex h-10 w-full max-w-md items-center gap-3 border-2 px-2 py-8 text-left transition-colors",
        selectedIndex === index
          ? "bg-main text-main-foreground"
          : "border-border bg-background text-foreground hover:bg-secondary-background",
      )}
    >
      <div className="rounded-base border-border flex size-12 shrink-0 items-center justify-center border">
        {track.cover ? (
          <Image
            src={track.cover}
            alt={track.album}
            width={80}
            height={80}
            className="rounded-base size-full object-cover"
          />
        ) : (
          <Music className="text-muted-foreground size-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="max-w-52 truncate text-sm font-bold">{track.title}</p>
        <p
          className={cn(
            "max-w-52 truncate text-xs",
            selectedIndex === index
              ? "text-main-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {track.artist}
        </p>
      </div>

      <div className="shrink-0">
        {isSelected ? (
          <Button
            size="icon"
            variant="neutral"
            className="shadow-none"
            onClick={(e) => {
              e.stopPropagation(); // ← prevent double trigger
              handleClick();
            }}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">
            {formatTime(Math.floor(track.duration))}
          </span>
        )}
      </div>
    </div>
  );
};

export default MusicCard;
