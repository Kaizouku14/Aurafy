import { MOOD_MAP, type Mood } from "@/constants/chat";
import { spotify } from "@/lib/spotify";
import { getErrorMessage } from "@/lib/utils";
import { db } from "@/server/db";
import { account } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

const getSpotifyToken = async (userId: string) => {
  const [result] = await db
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
    .limit(1);

  if (!result?.accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Spotify account not connected",
    });
  }

  return result.accessToken;
};

export const handleSpotifyMood = async (userId: string, mood: Mood) => {
  try {
    const accessToken = await getSpotifyToken(userId);
    spotify.setAccessToken(accessToken);

    const params = MOOD_MAP[mood];

    const { body } = await spotify.getRecommendations({
      seed_genres: [...params.genres],
      target_energy: params.energy,
      target_valence: params.valence,
      min_tempo: params.minTempo,
      max_tempo: params.maxTempo,
      limit: 10,
    });

    return (body.tracks ?? []).map((track) => ({
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
    console.error("Spotify error:", {
      message: (error as any)?.message,
      statusCode: (error as any)?.statusCode,
      body: JSON.stringify((error as any)?.body),
      stack: (error as any)?.stack,
    });

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
  artist: string,
) => {
  try {
    const accessToken = await getSpotifyToken(userId);
    spotify.setAccessToken(accessToken);

    const { body } = await spotify.searchTracks(
      `track:${songTitle} artist:${artist}`,
      { limit: 5 },
    );

    return (body.tracks?.items ?? []).map((track) => ({
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
