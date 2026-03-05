import { authClient } from "@/server/better-auth/client";

export const fetchFreshToken = async (): Promise<string> => {
  const result = await authClient.getAccessToken({
    providerId: "spotify",
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
};
