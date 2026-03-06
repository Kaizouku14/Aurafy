import { env } from "@/env";
import { getSpotifyToken } from "@/server/better-auth";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const createSpotifyClient = (accessToken: string) =>
  SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID!, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 60,
    refresh_token: "",
  });

export const getSpotifyClient = async (userId: string) => {
  const accessToken = await getSpotifyToken(userId);
  return createSpotifyClient(accessToken);
};
