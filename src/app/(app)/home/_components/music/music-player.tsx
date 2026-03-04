import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { formatTime } from "@/lib/utils";

const PLACEHOLDER = {
  title: "No song playing",
  artist: "—",
  cover: null as string | null,
  currentTime: 0,
  duration: 0,
};

interface MusicPlayerProps {
  title?: string;
  artist?: string;
  cover?: string | null;
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  isMuted?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onMute?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  title = PLACEHOLDER.title,
  artist = PLACEHOLDER.artist,
  cover = PLACEHOLDER.cover,
  currentTime = PLACEHOLDER.currentTime,
  duration = PLACEHOLDER.duration,
  isPlaying = false,
  isMuted = false,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onMute,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasSong = title !== PLACEHOLDER.title;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-main/20 rounded-base flex size-10 shrink-0 items-center justify-center overflow-hidden border-2 border-black">
          {cover ? (
            <Image src={cover} alt={title} className="size-full object-cover" />
          ) : (
            <Play className="text-main size-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-bold">{title}</p>
          <p className="text-muted-foreground truncate text-xs">{artist}</p>
        </div>

        <Button
          type="button"
          onClick={onMute}
          disabled={!hasSong}
          className="text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-8 text-right text-[10px]">
          {formatTime(currentTime)}
        </span>

        <Progress value={progress} className="w-full" />

        <span className="text-muted-foreground w-8 text-[10px]">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="neutral"
          size="icon"
          onClick={onPrev}
          disabled={!hasSong}
          className="size-8"
        >
          <SkipBack className="size-3.5" />
        </Button>

        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!hasSong}
          className="size-9"
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant="neutral"
          size="icon"
          onClick={onNext}
          disabled={!hasSong}
          className="size-8"
        >
          <SkipForward className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default MusicPlayer;
