import { create } from "zustand";
import type { SpotifyTrack } from "@/types/spotify";
import { fetchFreshToken } from "@/lib/spotify-auth";

interface PlayerState {
  tracks: SpotifyTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  // Premium
  player: Spotify.Player | null;
  deviceId: string | null;
  accessToken: string | null;
  isPremium: boolean;
  // Free
  audio: HTMLAudioElement | null;

  setTracks: (tracks: SpotifyTrack[]) => void;
  setPlayer: (player: Spotify.Player | null) => void;
  setDeviceId: (deviceId: string | null) => void;
  setAccessToken: (token: string) => void;
  setIsPremium: (isPremium: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setCurrentIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  mute: () => void;
  next: () => void;
  prev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  player: null,
  deviceId: null,
  accessToken: null,
  isPremium: false,
  audio: null,

  setPlayer: (player) => set({ player }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsPremium: (isPremium) => set({ isPremium }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),

  setTracks: (tracks) => {
    const { audio, player, isPremium } = get();

    // Stop whatever is currently playing
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    if (isPremium && player) {
      player.pause();
    }

    set({
      tracks,
      currentIndex: 0,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      audio: null,
    });

    // Auto-play the first track if tracks were loaded
    if (tracks.length > 0) {
      // Use setTimeout to ensure state is settled before triggering playback
      setTimeout(() => {
        get().setCurrentIndex(0);
      }, 0);
    }
  },

  setCurrentIndex: async (index) => {
    const { tracks, audio, isPremium, deviceId, accessToken, player } = get();

    // Stop current audio (free tier)
    if (audio) {
      audio.pause();
      audio.src = "";
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
      // Premium — use Spotify Web API to start playback on the SDK device.
      // Always fetch a fresh token to avoid 401s from expired tokens.
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
          console.log("Spotify play API returned 401, refreshing token...");
          token = await fetchFreshToken();
          set({ accessToken: token });
          response = await makePlayRequest(token);
        }

        if (response.ok || response.status === 204) {
          set({ isPlaying: true });
        } else {
          const errorBody = await response.text();
          console.error(
            `Spotify play API error (${response.status}):`,
            errorBody,
          );
        }
      } catch (error) {
        console.error("Failed to start Spotify playback:", error);
      }
    } else {
      // Free — use preview_url as fallback
      if (!track.previewUrl) {
        console.warn(
          `No preview URL available for "${track.title}" — cannot play on free tier.`,
        );
        set({ audio: null });
        return;
      }

      const newAudio = new Audio(track.previewUrl);

      newAudio.addEventListener("timeupdate", () => {
        set({ currentTime: newAudio.currentTime * 1000 }); //  convert to ms
      });

      newAudio.addEventListener("loadedmetadata", () => {
        set({ duration: newAudio.duration * 1000 });
      });

      newAudio.addEventListener("ended", () => {
        get().next();
      });

      newAudio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        set({ isPlaying: false });
      });

      set({ audio: newAudio });

      try {
        await newAudio.play();
        set({ isPlaying: true });
      } catch (error) {
        console.error("Failed to play audio preview:", error);
        set({ isPlaying: false });
      }
    }
  },

  play: () => {
    const { audio, player, isPremium } = get();
    if (isPremium && player) {
      player.resume().then(() => {
        set({ isPlaying: true });
      });
    } else if (audio) {
      audio.play().then(() => {
        set({ isPlaying: true });
      });
    }
  },

  pause: () => {
    const { audio, player, isPremium } = get();
    if (isPremium && player) {
      player.pause().then(() => {
        set({ isPlaying: false });
      });
    } else if (audio) {
      audio.pause();
      set({ isPlaying: false });
    }
  },

  mute: () => {
    const { audio, player, isMuted, isPremium } = get();
    if (isPremium && player) {
      player.setVolume(isMuted ? 0.5 : 0);
    } else if (audio) {
      audio.muted = !isMuted;
    }
    set({ isMuted: !isMuted });
  },

  next: () => {
    const { currentIndex, tracks } = get();
    if (currentIndex < tracks.length - 1) {
      get().setCurrentIndex(currentIndex + 1);
    } else {
      set({ isPlaying: false }); // stop playback at end of list
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      get().setCurrentIndex(currentIndex - 1);
    }
  },
}));
