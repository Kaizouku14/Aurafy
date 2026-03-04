import { env } from "@/env";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const createSpotifyClient = (accessToken: string) =>
  SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID!, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    refresh_token: "",
  });
