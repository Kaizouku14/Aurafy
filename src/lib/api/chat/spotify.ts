import { MOOD_MAP, type Mood } from "@/constants/chat";
import { createSpotifyClient } from "@/lib/spotify";
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
    const client = createSpotifyClient(accessToken);

    const params = MOOD_MAP[mood];

    const results = await client.search(
      `genre:${params.genres[0]} ${mood}`,
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
  artist: string,
) => {
  try {
    const accessToken = await getSpotifyToken(userId);
    const client = createSpotifyClient(accessToken);

    const results = await client.search(
      `track:${songTitle} artist:${artist}`,
      ["track"],
      undefined,
      5,
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
