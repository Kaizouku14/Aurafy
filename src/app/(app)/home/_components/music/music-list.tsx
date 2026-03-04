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
import { Music, Play } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import MusicPlayer from "./music-player";
import MusicEmpty from "./music-empty";
import type { SpotifyTrack } from "@/types/spotify";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MusicListProps {
  tracks: SpotifyTrack[];
}

const MusicList: React.FC<MusicListProps> = ({ tracks }) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [tracks]);

  const selectedTrack = tracks[selectedIndex] ?? null;

  return (
    <Card className="flex w-full max-w-md flex-col pt-1">
      <CardHeader className="border-border border-b-2 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-main shadow-shadow rounded-base flex size-9 items-center justify-center border-2 border-black">
            <Music className="size-5 text-black" />
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
        <ScrollArea className="h-61">
          {tracks.length === 0 ? (
            <MusicEmpty />
          ) : (
            <div className="flex flex-col gap-1 px-2">
              {tracks.map((track, index) => (
                <Button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "rounded-base flex items-center gap-3 border-2 px-2 py-2 text-left transition-colors",
                    selectedIndex === index
                      ? "bg-main text-main-foreground shadow-shadow border-black"
                      : "border-border bg-background text-foreground hover:bg-secondary-background",
                  )}
                >
                  <div className="rounded-base flex size-10 shrink-0 items-center justify-center overflow-hidden border border-black">
                    {track.cover ? (
                      <Image
                        src={track.cover}
                        alt={track.album}
                        className="size-full object-cover"
                      />
                    ) : (
                      <Music className="text-muted-foreground size-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{track.title}</p>
                    <p
                      className={cn(
                        "truncate text-xs",
                        selectedIndex === index
                          ? "text-main-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {track.artist}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {selectedIndex === index ? (
                      <Play className="size-3.5" />
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {formatTime(track.duration)}
                      </span>
                    )}
                  </div>
                </Button>
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
          duration={
            selectedTrack ? Math.floor(selectedTrack.duration / 1000) : 0
          }
          onNext={() =>
            setSelectedIndex((i) => Math.min(i + 1, tracks.length - 1))
          }
          onPrev={() => setSelectedIndex((i) => Math.max(i - 1, 0))}
        />
      </CardFooter>
    </Card>
  );
};

export default MusicList;
