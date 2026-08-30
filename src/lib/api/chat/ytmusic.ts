import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { chat } from "@/server/db/schema";
import { INTENT_LABELS } from "@/constants/chat";
import type { ChatMetadata } from "@/types/schema/chat";
import YTMusic from "ytmusic-api";

type TrackShape = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  duration: number;
  uri: string;
  previewUrl: string | null;
};

export interface UserLibrary {
  topArtists: string[];
}

type YtTrackResult = {
  type?: "SONG" | "VIDEO";
  videoId: string;
  name: string;
  artist: { name: string };
  album?: { name: string } | null;
  duration?: number | null;
  thumbnails: Array<{ url: string }>;
};

let ytmusicClient: YTMusic | null = null;
let ytmusicClientPromise: Promise<YTMusic> | null = null;

const getYtMusicClient = async (): Promise<YTMusic> => {
  if (ytmusicClient) return ytmusicClient;
  if (ytmusicClientPromise) return ytmusicClientPromise;

  ytmusicClientPromise = (async () => {
    const client = new YTMusic();
    await client.initialize();
    ytmusicClient = client;
    return client;
  })();

  return ytmusicClientPromise;
};

const mapTrack = (result: YtTrackResult): TrackShape => ({
  id: `ytmusic:${result.videoId}`,
  title: result.name,
  artist: result.artist.name,
  album: result.album?.name ?? "Unknown album",
  cover: result.thumbnails[0]?.url ?? null,
  duration: (result.duration ?? 0) * 1000,
  uri: result.videoId
    ? `https://music.youtube.com/watch?v=${result.videoId}`
    : "",
  previewUrl: result.videoId ? `/api/ytmusic/stream/${result.videoId}` : null,
});

const deduplicateTracks = (tracks: TrackShape[]): TrackShape[] => {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
};

const searchTracks = async (query: string, limit = 10): Promise<TrackShape[]> => {
  const client = await getYtMusicClient();
  const songs = await client.searchSongs(query);
  return songs.slice(0, limit).map(mapTrack);
};

const getPlaylistTracks = async (
  query: string,
  limit = 4,
): Promise<TrackShape[]> => {
  const client = await getYtMusicClient();
  const playlists = await client.searchPlaylists(query);
  const playlist = playlists[0];
  if (!playlist?.playlistId) return [];

  const videos = await client.getPlaylistVideos(playlist.playlistId);
  return videos.slice(0, limit).map(mapTrack);
};

export const fetchUserLibrary = async (
  userId: string,
): Promise<UserLibrary> => {
  try {
    const rows = await db
      .select({ metadata: chat.metadata })
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt))
      .limit(100);

    const artists: string[] = [];

    for (const row of rows) {
      if (!row.metadata) continue;
      try {
        const meta = JSON.parse(row.metadata) as ChatMetadata;
        if (
          (meta.intent === INTENT_LABELS.PLAY_ARTIST ||
            meta.intent === INTENT_LABELS.PLAY_SONG) &&
          meta.artist
        ) {
          artists.push(meta.artist);
        }
      } catch {
        // skip malformed metadata
      }
    }

    return { topArtists: [...new Set(artists)].slice(0, 6) };
  } catch (error) {
    console.warn("[ytmusic] Failed to load top artists:", error);
    return { topArtists: [] };
  }
};

export const handleYtMusicMood = async (
  _userId: string,
  _mood: string,
  queries: string[],
): Promise<TrackShape[]> => {
  const results = await Promise.all(
    queries.map(async (query) => {
      const fromPlaylist = await getPlaylistTracks(query);
      if (fromPlaylist.length > 0) return fromPlaylist;
      return (await searchTracks(query, 10)).slice(0, 4);
    }),
  );

  return deduplicateTracks(results.flat()).slice(0, 10);
};

export const handleYtMusicSong = async (
  _userId: string,
  songTitle: string,
  artist?: string | null,
): Promise<TrackShape[]> => {
  const query = artist ? `${songTitle} ${artist}` : songTitle;
  return searchTracks(query, 10);
};

export const handleYtMusicArtist = async (
  _userId: string,
  artist: string,
): Promise<TrackShape[]> => {
  return searchTracks(`artist ${artist}`, 10);
};