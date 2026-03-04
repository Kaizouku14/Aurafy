import { create } from "zustand";
import type { SpotifyTrack } from "@/types/spotify";

interface PlayerState {
  tracks: SpotifyTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  audio: HTMLAudioElement | null;

  setTracks: (tracks: SpotifyTrack[]) => void;
  play: () => void;
  pause: () => void;
  mute: () => void;
  next: () => void;
  prev: () => void;
  setCurrentIndex: (index: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  isMuted: false,
  currentTime: 0,
  audio: null,

  setTracks: (tracks) => {
    const { audio } = get();

    if (audio) {
      audio.pause();
      audio.src = "";
    }

    set({
      tracks,
      currentIndex: 0,
      currentTime: 0,
      isPlaying: false,
      audio: null,
    });
  },

  setCurrentIndex: (index) => {
    const { audio, tracks } = get();

    if (audio) {
      audio.pause();
      audio.src = "";
    }

    const track = tracks[index];
    if (!track?.previewUrl) {
      set({
        currentIndex: index,
        audio: null,
        currentTime: 0,
        isPlaying: false,
      });
      return;
    }

    const newAudio = new Audio(track.previewUrl);

    newAudio.addEventListener("timeupdate", () => {
      set({ currentTime: newAudio.currentTime });
    });

    newAudio.addEventListener("ended", () => {
      get().next();
    });

    set({
      currentIndex: index,
      audio: newAudio,
      currentTime: 0,
      isPlaying: false,
    });
  },

  play: () => {
    const { audio } = get();
    audio?.play();
    set({ isPlaying: true });
  },

  pause: () => {
    const { audio } = get();
    audio?.pause();
    set({ isPlaying: false });
  },

  mute: () => {
    const { audio, isMuted } = get();
    if (audio) audio.muted = !isMuted;
    set({ isMuted: !isMuted });
  },

  next: () => {
    const { currentIndex, tracks } = get();
    if (currentIndex < tracks.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      get().setCurrentIndex(currentIndex - 1);
    }
  },
}));
