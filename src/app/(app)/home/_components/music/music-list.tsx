"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";
import MusicPlayer from "./music-player";
import MusicEmpty from "./music-empty";
import MusicCard from "./music-card";
import { usePlayerStore } from "@/store/play-store";

const MusicList = () => {
  const {
    currentIndex,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    setCurrentIndex,
    play,
    pause,
    mute,
    next,
    prev,
    tracks,
    volume,
    seek,
    setVolume,
  } = usePlayerStore();

  const selectedTrack = tracks[currentIndex] ?? null;

  return (
    <div className="border-border bg-background shadow-shadow flex h-full flex-col border-2">
      {/* Header */}
      <div className="border-border flex items-center gap-2.5 border-b-2 px-4 py-3">
        <div className="bg-main border-border flex size-8 shrink-0 items-center justify-center border-2">
          <Music className="text-main-foreground size-4" />
        </div>
        <div>
          <p className="text-foreground text-sm font-black tracking-tight">
            Your Music
          </p>
          <p className="text-muted-foreground text-[11px]">via Spotify</p>
        </div>
      </div>

      {/* Track list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {tracks.length === 0 ? (
            <MusicEmpty />
          ) : (
            <div className="flex flex-col gap-px">
              {tracks.map((track, index) => (
                <MusicCard
                  key={track.id}
                  index={index}
                  track={track}
                  selectedIndex={currentIndex}
                  setSelectedIndex={setCurrentIndex}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Player controls */}
      <div className="border-border border-t-2 px-4 py-3">
        <MusicPlayer
          title={selectedTrack?.title}
          artist={selectedTrack?.artist}
          cover={selectedTrack?.cover}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          isMuted={isMuted}
          onPlay={play}
          onPause={pause}
          onMute={mute}
          onNext={next}
          onPrev={prev}
          volume={volume}
          onSeek={seek}
          onVolumeChange={setVolume}
        />
      </div>
    </div>
  );
};

export default MusicList;
