"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Music } from "lucide-react";
import { StaggerList } from "@/components/animation/stagger-list";
import { Button } from "@/components/ui/button";

import MusicPlayer from "./music-player";
import MusicEmpty from "./music-empty";
import MusicCard from "./music-card";
import { usePlayerStore } from "@/store/play-store";
import { useMusicProviderStore } from "@/store/music-provider-store";

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
    switchProvider,
  } = usePlayerStore();
  const { activeProvider, hasSpotifyAuth, isSpotifyPremium } =
    useMusicProviderStore();

  const providerLabel =
    activeProvider === "spotify" ? "Spotify" : "YouTube Music";
  const canSwitchProvider = hasSpotifyAuth && !isSpotifyPremium;

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
          <p className="text-muted-foreground text-[11px]">
            via {providerLabel}
          </p>
        </div>

        {canSwitchProvider && (
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant={activeProvider === "spotify" ? "default" : "neutral"}
              onClick={() => void switchProvider("spotify")}
            >
              Spotify
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeProvider === "ytmusic" ? "default" : "neutral"}
              onClick={() => void switchProvider("ytmusic")}
            >
              YT Music
            </Button>
          </div>
        )}
      </div>

      <div className="bg-secondary/30 border-border border-b-2 px-4 py-2 text-[11px] leading-snug">
        {!hasSpotifyAuth ? (
          <p className="text-muted-foreground">
            Spotify not connected. Using YouTube Music by default.
          </p>
        ) : isSpotifyPremium ? (
          <p className="text-muted-foreground">
            Spotify Premium detected. Playback is locked to Spotify.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Free Spotify account detected. You can switch between Spotify and
            YouTube Music.
          </p>
        )}
      </div>

      {/* Track list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {tracks.length === 0 ? (
            <MusicEmpty />
          ) : (
            <StaggerList
              className="flex flex-col gap-px"
              itemDistance={15}
              staggerDelay={0.05}
              animateExit={false}
            >
              {tracks.map((track, index) => (
                <MusicCard
                  key={track.id}
                  index={index}
                  track={track}
                  selectedIndex={currentIndex}
                  setSelectedIndex={setCurrentIndex}
                />
              ))}
            </StaggerList>
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
