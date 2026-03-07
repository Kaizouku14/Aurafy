import { MOOD_MAP, type Mood } from "@/constants/chat";
import { getSpotifyClient } from "@/lib/spotfiy/spotify";
import { getErrorMessage } from "@/lib/utils";
import type { Artist, Track } from "@spotify/web-api-ts-sdk";
import { TRPCError } from "@trpc/server";
import { cachedFetch } from "@/lib/spotfiy/spotify-cache";

const mapTrack = (track: Track) => ({
  id: track.id,
  title: track.name,
  artist: track.artists.map((a) => a.name).join(", "),
  album: track.album.name,
  cover: track.album.images[0]?.url ?? null,
  duration: track.duration_ms,
  uri: track.uri,
  previewUrl: track.preview_url,
});

const withSpotifyError = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};

const deduplicateTracks = (
  tracks: ReturnType<typeof mapTrack>[],
): ReturnType<typeof mapTrack>[] => {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
};

export const getUserTopArtists = async (userId: string): Promise<string[]> =>
  cachedFetch(`topArtists:${userId}`, 5 * 60 * 1000, () =>
    withSpotifyError(async () => {
      const client = await getSpotifyClient(userId);
      const result = await client.currentUser.topItems(
        "artists",
        "short_term",
        5,
      );
      return result.items.map((a: Artist) => a.name);
    })
  );


export interface UserLibrary {
  topArtists: string[];
}

export const fetchUserLibrary = async (
  userId: string,
): Promise<UserLibrary> => {
  const topArtists = await getUserTopArtists(userId).catch(() => []);
  return { topArtists };
};

export const handleSpotifyMood = async (
  userId: string,
  mood: Mood,
  library: UserLibrary,
) =>
  cachedFetch(`moodTracks:${userId}:${mood}`, 2 * 60 * 1000, () =>
    withSpotifyError(async () => {
      const client = await getSpotifyClient(userId);
      const { genres } = MOOD_MAP[mood];
      const moodGenre = genres[0] ?? "";
      const collected: ReturnType<typeof mapTrack>[] = [];

      if (library.topArtists.length > 0) {
        const artistQueries = library.topArtists.slice(0, 3).map((artist) =>
          client
            .search(`genre:${moodGenre} artist:${artist}`, ["track"], undefined, 5)
            .then((r) => r.tracks.items.map(mapTrack))
            .catch(() => []),
        );
        const results = await Promise.all(artistQueries);
        collected.push(...results.flat());
      }

      if (collected.length >= 10) {
        return deduplicateTracks(collected).slice(0, 10);
      }

      const fallbackQuery = genres.join(" ");
      const fallback = await client.search(
        fallbackQuery,
        ["track"],
        undefined,
        10,
      );
      collected.push(...fallback.tracks.items.map(mapTrack));

      return deduplicateTracks(collected).slice(0, 10);
    })
  );

export const handleSpotifySong = async (
  userId: string,
  songTitle: string,
  artist?: string | null,
) =>
  withSpotifyError(async () => {
    const client = await getSpotifyClient(userId);
    const query = artist
      ? `track:${songTitle} artist:${artist}`
      : `track:${songTitle}`;
    const results = await client.search(query, ["track"], undefined, 10);
    return results.tracks.items.map(mapTrack);
  });

export const handleSpotifyArtist = async (userId: string, artist: string) =>
  withSpotifyError(async () => {
    const client = await getSpotifyClient(userId);
    const [artistResults, trackResults] = await Promise.all([
      client.search(`artist:${artist}`, ["artist"], undefined, 1),
      client.search(`artist:${artist}`, ["track"], undefined, 10),
    ]);

    const artistId = artistResults.artists.items[0]?.id;
    if (!artistId) return [];

    return trackResults.tracks.items
      .filter((track) => track.artists.some((a) => a.id === artistId))
      .map(mapTrack);
  });
