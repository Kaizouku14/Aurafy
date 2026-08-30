import { MOOD_MAP, type Mood } from "@/constants/chat";
import { getSpotifyClient } from "@/lib/spotfiy/spotify";
import { getErrorMessage } from "@/lib/utils";
import type { Artist, Track, AudioFeatures } from "@spotify/web-api-ts-sdk";
import { TRPCError } from "@trpc/server";
import { cachedFetch } from "@/lib/spotfiy/spotify-cache";
import type { MoodProfile } from "./music-provider";

type MappedTrack = ReturnType<typeof mapTrack>;

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
  tracks: MappedTrack[],
): MappedTrack[] => {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
};

const rankByMoodProfile = (
  tracks: MappedTrack[],
  features: AudioFeatures[],
  profile: MoodProfile,
): MappedTrack[] => {
  const featureById = new Map(features.map((f) => [f.id, f]));
  const targetTempo = profile.tempo / 200;

  const scored = tracks.map((track) => {
    const feature = featureById.get(track.id);
    if (!feature) {
      return { track, distance: Number.POSITIVE_INFINITY };
    }

    const tempoDelta = feature.tempo / 200 - targetTempo;
    const distance = Math.sqrt(
      Math.pow(feature.energy - profile.energy, 2) +
        Math.pow(feature.valence - profile.valence, 2) +
        Math.pow(tempoDelta, 2),
    );

    return { track, distance };
  });

  scored.sort((a, b) => a.distance - b.distance);
  return scored.map((s) => s.track);
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
  queries: string[],
  profile: MoodProfile,
) =>
  cachedFetch(
    `moodTracks:${userId}:${mood}:${queries.join("|")}`,
    2 * 60 * 1000,
    () =>
      withSpotifyError(async () => {
        const client = await getSpotifyClient(userId);

        const searchQueries = [
          ...queries,
          ...library.topArtists
            .slice(0, 3)
            .map((artist) => `${artist} ${queries[0] ?? MOOD_MAP[mood].genres[0] ?? ""}`),
        ];

        const results = await Promise.all(
          searchQueries.map((query) =>
            client
              .search(query, ["track"], undefined, 10)
              .then((r) => r.tracks.items.map(mapTrack))
              .catch(() => []),
          ),
        );

        let collected = deduplicateTracks(results.flat());

        if (collected.length === 0) {
          const { genres } = MOOD_MAP[mood];
          const fallback = await client.search(
            genres.join(" "),
            ["track"],
            undefined,
            10,
          );
          collected = deduplicateTracks(fallback.tracks.items.map(mapTrack));
        }

        try {
          const ids = [...new Set(collected.map((t) => t.id))].slice(0, 50);
          if (ids.length > 0) {
            const features = await client.tracks.audioFeatures(ids);
            collected = rankByMoodProfile(collected, features, profile);
          }
        } catch (error) {
          console.warn("[handleSpotifyMood] Audio feature ranking failed:", error);
        }

        return collected.slice(0, 10);
      }),
  );

export const handleSpotifySong = async (
  userId: string,
  songTitle: string,
  artist?: string | null,
) =>
  withSpotifyError(async () => {
    try {
      const client = await getSpotifyClient(userId);
      const query = artist
        ? `${songTitle} ${artist}`
        : songTitle;

      const results = await client.search(query, ["track"], undefined, 10);

      return results.tracks.items.map(mapTrack);
    } catch (error) {
      console.error("[Spotify Search] FATAL ERROR:");
      console.error(error);
      throw error;
    }
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

    return trackResults.tracks.items.reduce<ReturnType<typeof mapTrack>[]>(
      (matched, track) => {
        if (track.artists.some((a) => a.id === artistId)) {
          matched.push(mapTrack(track));
        }
        return matched;
      },
      [],
    );
  });
