import { auth } from ".";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/server/db";
import { account } from "@/server/db/schema/user";
import { eq, and } from "drizzle-orm";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

let serverTokenPromise: Promise<string> | null = null;

export const getSpotifyToken = cache(async (userId: string) => {
  if (serverTokenPromise) return serverTokenPromise;

  serverTokenPromise = (async () => {
    try {
      const dbAccount = await db.query.account.findFirst({
        where: and(
          eq(account.userId, userId),
          eq(account.providerId, "spotify"),
        ),
      });

      if (!dbAccount?.accessToken) {
        throw new Error("Spotify access token not found in DB");
      }

      const isExpired =
        dbAccount.accessTokenExpiresAt &&
        dbAccount.accessTokenExpiresAt.getTime() - Date.now() < 60000;

      if (!isExpired) {
        return dbAccount.accessToken;
      }

      if (!dbAccount.refreshToken) {
        throw new Error("Spotify token expired and no refresh token available");
      }

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: dbAccount.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Spotify refresh failed: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
        refresh_token?: string;
      };

      await db
        .update(account)
        .set({
          accessToken: data.access_token,
          accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
          ...(data.refresh_token && { refreshToken: data.refresh_token }),
          updatedAt: new Date(),
        })
        .where(eq(account.id, dbAccount.id));

      return data.access_token;
    } finally {
      serverTokenPromise = null;
    }
  })();

  return serverTokenPromise;
});
