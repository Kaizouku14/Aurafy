import type { Mood } from "@/constants/chat";
import type { ProviderId } from "@/types/music-provider";
import {
  fetchUserLibrary as fetchSpotifyLibrary,
  handleSpotifyArtist,
  handleSpotifyMood,
  handleSpotifySong,
  type UserLibrary as SpotifyUserLibrary,
} from "./spotify";
import {
  fetchUserLibrary as fetchYtMusicLibrary,
  handleYtMusicArtist,
  handleYtMusicMood,
  handleYtMusicSong,
  type UserLibrary as YtMusicUserLibrary,
} from "./ytmusic";

export type ProviderUserLibrary = SpotifyUserLibrary | YtMusicUserLibrary;

export interface ProviderResolutionInput {
  preferredProvider?: ProviderId;
  hasSpotifyAuth?: boolean;
  isSpotifyPremium?: boolean;
}

export const resolveChatProvider = (
  input: ProviderResolutionInput,
): ProviderId => {
  if (!input.hasSpotifyAuth) return "ytmusic";
  if (input.isSpotifyPremium) return "spotify";

  if (
    input.preferredProvider === "spotify" ||
    input.preferredProvider === "ytmusic"
  ) {
    return input.preferredProvider;
  }

  return "ytmusic";
};

export const fetchUserLibraryByProvider = async (
  userId: string,
  provider: ProviderId,
): Promise<ProviderUserLibrary> => {
  if (provider === "spotify") {
    return fetchSpotifyLibrary(userId);
  }

  return fetchYtMusicLibrary(userId);
};

export const handleMoodByProvider = async (
  provider: ProviderId,
  userId: string,
  mood: Mood,
  library: ProviderUserLibrary,
) => {
  if (provider === "spotify") {
    return handleSpotifyMood(userId, mood, library);
  }

  return handleYtMusicMood(userId, mood, library);
};

export const handleSongByProvider = async (
  provider: ProviderId,
  userId: string,
  songTitle: string,
  artist?: string | null,
) => {
  if (provider === "spotify") {
    return handleSpotifySong(userId, songTitle, artist);
  }

  return handleYtMusicSong(userId, songTitle, artist);
};

export const handleArtistByProvider = async (
  provider: ProviderId,
  userId: string,
  artist: string,
) => {
  if (provider === "spotify") {
    return handleSpotifyArtist(userId, artist);
  }

  return handleYtMusicArtist(userId, artist);
};
