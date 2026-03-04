import SpotifyWebApi from "spotify-web-api-node";
import { env } from "@/env";

export const spotify = new SpotifyWebApi({
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_REDIRECT_URI,
});
