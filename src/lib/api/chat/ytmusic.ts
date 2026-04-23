import { MOOD_MAP, type Mood } from "@/constants/chat";
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

type YtMusicResult = {
  videoId: string;
  name: string;
  artist: { name: string };
  album: { name: string } | null;
  duration: number | null;
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

const mapTrack = (result: YtMusicResult): TrackShape => ({
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

const searchTracks = async (
  _userId: string,
  query: string,
  limit = 10,
): Promise<TrackShape[]> => {
  const client = await getYtMusicClient();
  const songs = (await client.searchSongs(query)) as YtMusicResult[];

  console.log("Songs", songs);
  return songs.slice(0, limit).map(mapTrack);
};

export const fetchUserLibrary = async (
  _userId: string,
): Promise<UserLibrary> => {
  return { topArtists: [] };
};

export const handleYtMusicMood = async (
  _userId: string,
  mood: Mood,
  _library: UserLibrary,
): Promise<TrackShape[]> => {
  const { genres } = MOOD_MAP[mood];
  const [primary, secondary] = genres;

  const queries = [
    [primary, "study"].filter(Boolean).join(" "),
    [secondary, "playlist"].filter(Boolean).join(" "),
  ];

  const results = await Promise.all(
    queries.map((query) => searchTracks(_userId, query, 10)),
  );

  console.dir(results, { depth: null });
  return deduplicateTracks(results.flat()).slice(0, 10);
};

export const handleYtMusicSong = async (
  _userId: string,
  songTitle: string,
  artist?: string | null,
): Promise<TrackShape[]> => {
  const query = artist ? `${songTitle} ${artist}` : songTitle;
  return searchTracks(_userId, query, 10);
};

export const handleYtMusicArtist = async (
  _userId: string,
  artist: string,
): Promise<TrackShape[]> => {
  return searchTracks(_userId, `artist ${artist}`, 10);
};
