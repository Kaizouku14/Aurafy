import { create } from "zustand";
import type { Track } from "@/types/schema/chat";
import { sileo } from "sileo";
import { getErrorMessage } from "@/lib/utils";
import { fetchFreshToken } from "@/lib/spotfiy/spotify-auth";

interface PlayerState {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  _progressInterval: ReturnType<typeof setInterval> | null;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  player: Spotify.Player | null;
  deviceId: string | null;
  accessToken: string | null;
  isPremium: boolean;
  audio: HTMLAudioElement | null;

  setTracks: (tracks: Track[]) => void;
  setPlayer: (player: Spotify.Player | null) => void;
  setDeviceId: (deviceId: string | null) => void;
  setAccessToken: (token: string) => void;
  setIsPremium: (isPremium: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setCurrentIndex: (index: number) => void;
  setVolume: (volume: number) => void;
  play: () => void;
  pause: () => void;
  mute: () => void;
  seek: (progress: number) => void;
  next: () => void;
  prev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  isMuted: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  player: null,
  deviceId: null,
  accessToken: null,
  isPremium: false,
  audio: null,
  _progressInterval: null,

  setPlayer: (player) => set({ player }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsPremium: (isPremium) => set({ isPremium }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  setVolume: (volume: number) => {
    const { audio, player, isPremium } = get();
    if (isPremium && player) {
      player.setVolume(volume);
    } else if (audio) {
      audio.volume = volume;
    }
    set({ volume, isMuted: volume === 0 });
  },

  setTracks: (tracks) => {
    const { audio, player, isPremium, _progressInterval } = get();

    if (audio) {
      audio.pause();
      audio.src = "";
    }
    if (isPremium && player) {
      player.pause();
    }
    if (_progressInterval) {
      clearInterval(_progressInterval);
    }

    set({
      tracks,
      currentIndex: 0,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      audio: null,
      _progressInterval: null,
    });

    if (tracks.length > 0) {
      setTimeout(() => {
        get().setCurrentIndex(0);
      }, 0);
    }
  },

  setCurrentIndex: async (index) => {
    const {
      player,
      tracks,
      audio,
      isPremium,
      deviceId,
      accessToken,
      _progressInterval,
    } = get();

    if (audio) {
      audio.pause();
      audio.src = "";
    }

    if (_progressInterval) {
      clearInterval(_progressInterval);
      set({ _progressInterval: null });
    }

    const track = tracks[index];
    if (!track) return;

    set({
      currentIndex: index,
      currentTime: 0,
      duration: track.duration,
      isPlaying: false,
      audio: null,
    });

    if (isPremium && deviceId) {
      const makePlayRequest = async (token: string) => {
        return fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [track.uri] }),
          },
        );
      };

      try {
        let token = accessToken ?? "";
        let response = await makePlayRequest(token);

        if (response.status === 401) {
          token = await fetchFreshToken();
          set({ accessToken: token });
          response = await makePlayRequest(token);
        }

        if (response.ok || response.status === 204) {
          const { _progressInterval: existing } = get();
          if (existing) clearInterval(existing);

          set({ isPlaying: true });

          const interval = setInterval(async () => {
            const state = await player?.getCurrentState();
            if (!state || state.paused) return;
            set({ currentTime: state.position });
          }, 500);

          set({ _progressInterval: interval });
        } else {
          const errorBody = await response.text();

          sileo.error({
            title: "Spotify play API error",
            description: `Failed to start playback: ${errorBody}`,
          });
        }
      } catch (error) {
        sileo.error({
          title: "Failed to start Spotify playback",
          description: getErrorMessage(error),
        });
      }
    } else {
      if (!track.previewUrl) {
        sileo.warning({
          title: "No preview URL available",
          description: `Cannot play "${track.title}" — cannot play on free tier.`,
        });
        set({ audio: null });
        return;
      }

      const newAudio = new Audio(track.previewUrl);
      const { volume, isMuted } = get();
      newAudio.volume = volume;
      newAudio.muted = isMuted;

      newAudio.addEventListener("timeupdate", () => {
        set({ currentTime: newAudio.currentTime * 1000 });
      });

      newAudio.addEventListener("loadedmetadata", () => {
        set({ duration: newAudio.duration * 1000 });
      });

      newAudio.addEventListener("ended", () => {
        get().next();
      });

      newAudio.addEventListener("error", (e) => {
        sileo.error({
          title: "Failed to play audio",
          description: "Failed to play audio preview: " + getErrorMessage(e),
        });
        set({ isPlaying: false });
      });

      set({ audio: newAudio });

      try {
        await newAudio.play();
        set({ isPlaying: true });
      } catch (error) {
        sileo.error({
          title: "Failed to play audio",
          description:
            "Failed to play audio preview: " + getErrorMessage(error),
        });
        set({ isPlaying: false });
      }
    }
  },

  play: () => {
    const { audio, player, isPremium } = get();
    if (isPremium && player) {
      player
        .resume()
        .then(() => set({ isPlaying: true }))
        .catch(() => sileo.error({ title: "Failed to resume playback" }));
    } else if (audio) {
      audio
        .play()
        .then(() => set({ isPlaying: true }))
        .catch(() => sileo.error({ title: "Failed to resume playback" }));
    }
  },

  pause: () => {
    const { audio, player, isPremium, _progressInterval } = get();

    if (_progressInterval) {
      clearInterval(_progressInterval);
      set({ _progressInterval: null });
    }

    if (isPremium && player) {
      player
        .pause()
        .then(() => set({ isPlaying: false }))
        .catch(() => sileo.error({ title: "Failed to pause playback" }));
    } else if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  mute: () => {
    const { audio, player, isMuted, isPremium, volume } = get();
    const newMuted = !isMuted;

    if (isPremium && player) {
      player.setVolume(newMuted ? 0 : volume);
    } else if (audio) {
      audio.muted = newMuted;
    }
    set({ isMuted: newMuted });
  },

  seek: (progress: number) => {
    const { audio, player, isPremium, duration } = get();
    const positionMs = progress * duration;

    if (isPremium && player) {
      player.seek(positionMs);
    } else if (audio) {
      audio.currentTime = positionMs / 1000;
    }
    set({ currentTime: positionMs });
  },

  next: () => {
    const { currentIndex, tracks } = get();
    if (currentIndex < tracks.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    } else {
      set({ isPlaying: false });
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      get().setCurrentIndex(currentIndex - 1);
    }
  },
}));
