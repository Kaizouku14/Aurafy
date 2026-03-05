import { MOOD_MAP, type Mood } from "@/constants/chat";
import { createSpotifyClient } from "@/lib/spotfiy/spotify";
import { getErrorMessage } from "@/lib/utils";
import { getSpotifyToken } from "@/server/better-auth";
import { TRPCError } from "@trpc/server";

export const handleSpotifyMood = async (userId: string, mood: Mood) => {
  try {
    const accessToken = await getSpotifyToken(userId);
    const client = createSpotifyClient(accessToken);

    const params = MOOD_MAP[mood];

    const results = await client.search(
      `genre:${params.genres.join(" ")}`,
      ["track"],
      undefined,
      10,
    );

    return results.tracks.items.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      cover: track.album.images[0]?.url ?? null,
      duration: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url,
    }));
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};

export const handleSpotifySong = async (
  userId: string,
  songTitle: string,
  artist?: string | null,
) => {
  try {
    const accessToken = await getSpotifyToken(userId);
    const client = createSpotifyClient(accessToken);

    let query = `track:${songTitle}`;

    if (artist) {
      query += ` artist:${artist}`;
    }

    const results = await client.search(query, ["track"], undefined, 5);

    return results.tracks.items.map((track) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      cover: track.album.images[0]?.url ?? null,
      duration: track.duration_ms,
      uri: track.uri,
      previewUrl: track.preview_url,
    }));
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};

export const handleSpotifyArtist = async (userId: string, artist: string) => {
  try {
    const accessToken = await getSpotifyToken(userId);
    const client = createSpotifyClient(accessToken);

    const results = await client.search(
      `artist:${artist}`,
      ["artist"],
      undefined,
      1,
    );

    const artistId = results.artists.items[0]?.id;

    if (!artistId) {
      return [];
    }

    const trackResults = await client.search(
      `artist:${artist}`,
      ["track"],
      undefined,
      10,
    );

    return trackResults.tracks.items
      .filter((track) => track.artists.some((a) => a.id === artistId))
      .map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        cover: track.album.images[0]?.url ?? null,
        duration: track.duration_ms,
        uri: track.uri,
        previewUrl: track.preview_url,
      }));
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};
