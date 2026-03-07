import { env } from "@/env";
import { getSpotifyToken } from "@/server/better-auth";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const getSpotifyClient = async (userId: string) => {
  const accessToken = await getSpotifyToken(userId);
  return SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "",
  });
};
