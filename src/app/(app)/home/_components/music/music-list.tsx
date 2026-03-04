"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";
import MusicPlayer from "./music-player";
import MusicEmpty from "./music-empty";
import type { SpotifyTrack } from "@/types/spotify";
import MusicCard from "./music-card";
import { usePlayerStore } from "@/store/play-store";

interface MusicListProps {
  tracks: SpotifyTrack[];
}

const MusicList: React.FC<MusicListProps> = ({ tracks }) => {
  const {
    currentIndex,
    isPlaying,
    isMuted,
    currentTime,
    setTracks,
    setCurrentIndex,
    play,
    pause,
    mute,
    next,
    prev,
  } = usePlayerStore();

  React.useEffect(() => {
    if (tracks.length > 0) setTracks(tracks);
  }, [tracks]);

  const selectedTrack = tracks[currentIndex] ?? null;

  return (
    <Card className="w-full max-w-md pt-1">
      <CardHeader className="border-border border-b-2 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-main shadow-shadow rounded-base border-border flex size-9 items-center justify-center border-2">
            <Music className="text-border size-5" />
          </div>
          <div>
            <CardTitle className="text-foreground text-base">
              Your Music
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Powered by Spotify
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-1">
        <ScrollArea className="h-65">
          {tracks.length === 0 ? (
            <MusicEmpty />
          ) : (
            <div className="flex flex-col gap-1 px-2.5">
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
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-border border-t-2 px-4 pt-4">
        <MusicPlayer
          title={selectedTrack?.title}
          artist={selectedTrack?.artist}
          cover={selectedTrack?.cover}
          currentTime={currentTime}
          duration={
            selectedTrack ? Math.floor(selectedTrack.duration / 1000) : 0
          }
          isPlaying={isPlaying}
          isMuted={isMuted}
          onPlay={play}
          onPause={pause}
          onMute={mute}
          onNext={next}
          onPrev={prev}
        />
      </CardFooter>
    </Card>
  );
};

export default MusicList;
