import { auth } from ".";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export const getSpotifyToken = cache(async (userId: string) => {
  const result = await auth.api.getAccessToken({
    body: { providerId: "spotify", userId },
    headers: await headers(),
  });

  if (!result?.accessToken) {
    throw new Error("Spotify access token not found");
  }

  return result.accessToken;
});
