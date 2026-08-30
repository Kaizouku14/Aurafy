import { authClient } from "@/server/better-auth/client";

let tokenPromise: Promise<string> | null = null;

export const fetchFreshToken = async (): Promise<string> => {
  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    try {
      const accountsResult = await authClient.listAccounts();

      const spotifyAccount = accountsResult.data?.find(
        (account) => account.providerId === "spotify",
      );

      if (!spotifyAccount) {
        throw new Error("No Spotify account linked");
      }

      const result = await authClient.getAccessToken({
        accountId: spotifyAccount.id,
      });

      if (result.error) {
        throw new Error(
          result.error.message ?? "Failed to get Spotify access token",
        );
      }

      if (!result.data?.accessToken) {
        throw new Error("No Spotify access token found");
      }

      return result.data.accessToken;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
};
