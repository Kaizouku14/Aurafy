"use client";

import React from "react";
import { SpotifyPlayerProvider } from "@/lib/spotfiy/spotify-player-provider";
import { YouTubePlayerProvider } from "@/lib/spotfiy/yt-player-provider";
import { useMusicProviderStore } from "@/store/music-provider-store";

export const PlayerProviders = ({
  accessToken,
}: {
  accessToken: string | null;
}) => {
  const activeProvider = useMusicProviderStore((state) => state.activeProvider);
  const setSpotifyAuth = useMusicProviderStore((state) => state.setSpotifyAuth);

  React.useEffect(() => {
    setSpotifyAuth(Boolean(accessToken));
  }, [accessToken, setSpotifyAuth]);

  return (
    <>
      {activeProvider === "spotify" && accessToken ? (
        <SpotifyPlayerProvider accessToken={accessToken} />
      ) : null}
      <YouTubePlayerProvider />
    </>
  );
};
