"use client";

import { cn, formatTime } from "@/lib/utils";
import { usePlayerStore } from "@/store/play-store";
import type { Track } from "@/types/schema/chat";
import { Music, Pause, Play } from "lucide-react";
import Image from "next/image";

interface MusicCardProps {
  index: number;
  track: Track;
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
    if (isSelected) {
      isPlaying ? pause() : play();
      return;
    }
    setSelectedIndex(index);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left transition-colors",
        isSelected
          ? "bg-secondary-background border-l-main border-l-[3px]"
          : "border-l-[3px] border-l-transparent hover:bg-secondary-background",
      )}
    >
      <div className="border-border flex size-9 shrink-0 items-center justify-center overflow-hidden border">
        {track.cover ? (
          <Image
            src={track.cover}
            alt={track.album}
            width={36}
            height={36}
            className="size-full object-cover"
          />
        ) : (
          <Music className="text-muted-foreground size-3.5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-xs font-bold",
            isSelected ? "text-foreground" : "text-foreground",
          )}
        >
          {track.title}
        </p>
        <p className="text-muted-foreground truncate text-[11px]">
          {track.artist}
        </p>
      </div>

      <div className="shrink-0">
        {isSelected ? (
          <button
            className="text-main flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="text-muted-foreground text-[11px]">
            {formatTime(Math.floor(track.duration))}
          </span>
        )}
      </div>
    </div>
  );
};

export default MusicCard;
