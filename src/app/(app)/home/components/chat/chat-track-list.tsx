"use client";

import React from "react";
import Image from "next/image";
import { Music, Pause, Play } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { usePlayerStore } from "@/store/play-store";
import type { Track } from "@/types/schema/chat";

interface ChatTrackListProps {
  tracks: Track[];
}

const ChatTrackList: React.FC<ChatTrackListProps> = ({ tracks }) => {
  const playerIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setCurrentIndex = usePlayerStore((s) => s.setCurrentIndex);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);

  const handleClick = (index: number) => {
    if (playerIndex === index) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
      return;
    }
    void setCurrentIndex(index);
  };

  return (
    <div className="mt-2 sm:hidden  flex flex-col ">
      <p className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase tracking-widest">
        Queued · tap to play
      </p>
      {tracks.map((track, index) => {
        const isCurrent = playerIndex === index;

        return (
          <div
            key={track.id}
            role="button"
            tabIndex={0}
            aria-pressed={isCurrent}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(index);
              }
            }}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 px-1.5 py-1.5 text-left transition-colors",
              isCurrent
                ? "border-l-main bg-secondary-background border-l-[3px]"
                : "border-l-[3px] border-l-transparent hover:bg-secondary-background",
            )}
          >
            <div className="border-border flex size-8 shrink-0 items-center justify-center overflow-hidden border">
              {track.cover ? (
                <Image
                  src={track.cover}
                  alt={track.album}
                  width={32}
                  height={32}
                  className="size-full object-cover"
                />
              ) : (
                <Music className="text-muted-foreground size-3.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p title={track.title} className="truncate text-[11px] font-bold w-28">
                {track.title}
              </p>
              <p className="text-muted-foreground truncate text-[10px]">
                {track.artist}
              </p>
            </div>

            <div className="shrink-0">
              {isCurrent ? (
                <span aria-hidden="true" className="text-main flex items-center justify-center">
                  {isPlaying ? (
                    <Pause className="size-3" />
                  ) : (
                    <Play className="size-3" />
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground text-[10px]">
                  {formatTime(Math.floor(track.duration))}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatTrackList;
