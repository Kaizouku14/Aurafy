import { MOOD_MAP, type Mood } from "@/constants/chat";
import { getSpotifyClient } from "@/lib/spotfiy/spotify";
import { getErrorMessage } from "@/lib/utils";
import type { Track } from "@spotify/web-api-ts-sdk";
import { TRPCError } from "@trpc/server";

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

export const handleSpotifyMood = async (userId: string, mood: Mood) =>
  withSpotifyError(async () => {
    const client = await getSpotifyClient(userId);
    const { genres } = MOOD_MAP[mood];
    const results = await client.search(
      `genre:${genres.join(" ")}`,
      ["track"],
      undefined,
      10,
    );
    return results.tracks.items.map(mapTrack);
  });

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
    const results = await client.search(query, ["track"], undefined, 5);
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
