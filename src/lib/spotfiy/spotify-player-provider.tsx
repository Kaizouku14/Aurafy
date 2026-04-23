"use client";

import { usePlayerStore } from "@/store/play-store";
import { useMusicProviderStore } from "@/store/music-provider-store";
import React from "react";
import { sileo } from "sileo";
import { fetchFreshToken } from "./spotify-auth";

const SPOTIFY_SDK_SRC = "https://sdk.scdn.co/spotify-player.js";
const SPOTIFY_SDK_SCRIPT_ID = "spotify-player-sdk";

let spotifySdkReadyPromise: Promise<void> | null = null;

function ensureSpotifySdkReady(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify SDK can only load in browser."));
  }

  if (window.Spotify) {
    return Promise.resolve();
  }

  if (!spotifySdkReadyPromise) {
    spotifySdkReadyPromise = new Promise<void>((resolve, reject) => {
      const previousReadyHandler = window.onSpotifyWebPlaybackSDKReady;
      const existingScript = document.getElementById(
        SPOTIFY_SDK_SCRIPT_ID,
      ) as HTMLScriptElement | null;

      const onReady = () => {
        if (typeof previousReadyHandler === "function") {
          previousReadyHandler();
        }
        resolve();
      };

      window.onSpotifyWebPlaybackSDKReady = onReady;

      if (existingScript) {
        existingScript.addEventListener("load", onReady, { once: true });
        existingScript.addEventListener(
          "error",
          () => {
            spotifySdkReadyPromise = null;
            reject(new Error("Failed to load Spotify Web Playback SDK."));
          },
          { once: true },
        );

        if (window.Spotify) {
          onReady();
        }

        return;
      }

      const script = document.createElement("script");
      script.id = SPOTIFY_SDK_SCRIPT_ID;
      script.src = SPOTIFY_SDK_SRC;
      script.async = true;
      script.onerror = () => {
        spotifySdkReadyPromise = null;
        reject(new Error("Failed to load Spotify Web Playback SDK."));
      };

      (document.head ?? document.body).appendChild(script);
    });
  }

  return spotifySdkReadyPromise;
}

export const SpotifyPlayerProvider = ({
  accessToken: initialAccessToken,
}: {
  accessToken: string;
}) => {
  React.useEffect(() => {
    const {
      volume,
      next,
      setAccessToken,
      setIsPremium,
      setPlayer,
      setDeviceId,
    } = usePlayerStore.getState();
    const { setSpotifyAuth, setSpotifyPremium } =
      useMusicProviderStore.getState();

    let isAdvancing = false;
    let playbackErrorTimer: ReturnType<typeof setTimeout> | null = null;
    let isUnmounted = false;
    let localPlayer: Spotify.Player | null = null;

    setAccessToken(initialAccessToken);
    setIsPremium(true);
    setSpotifyAuth(true);
    setSpotifyPremium(true);

    void ensureSpotifySdkReady()
      .then(() => {
        if (isUnmounted || !window.Spotify) return;

        const player = new window.Spotify.Player({
          name: "Aurafy Player",
          getOAuthToken: (cb) => {
            fetchFreshToken()
              .then((freshToken) => {
                setAccessToken(freshToken);
                cb(freshToken);
              })
              .catch(() => {
                const fallback = usePlayerStore.getState().accessToken;
                if (fallback) cb(fallback);
              });
          },
          volume,
        });

        localPlayer = player;

        player.addListener("initialization_error", () => {
          sileo.error({
            title: "Spotify initialization failed",
            description: "Please try again later.",
          });
        });

        player.addListener("authentication_error", () => {
          fetchFreshToken()
            .then((freshToken) => setAccessToken(freshToken))
            .catch(() => {
              sileo.error({
                title: "Spotify authentication failed",
                description: "Please log in again.",
              });

              setIsPremium(false);
              setSpotifyPremium(false);
            });
        });

        player.addListener("account_error", () => {
          sileo.error({
            title: "Premium required",
            description: "Please upgrade to Premium to continue listening.",
          });
          setIsPremium(false);
          setSpotifyPremium(false);
        });

        player.addListener("playback_error", () => {
          playbackErrorTimer = setTimeout(() => {
            const { isPlaying } = usePlayerStore.getState();
            if (!isPlaying) {
              sileo.error({
                title: "Playback error",
                description: "Failed to play this track.",
              });
            }
          }, 2000);
        });

        player.addListener("ready", ({ device_id }) => {
          setDeviceId(device_id);
        });

        player.addListener("not_ready", () => {
          sileo.warning({
            title: "Spotify player disconnected. Reconnecting...",
          });
          setDeviceId(null);
        });

        player.addListener("player_state_changed", (state) => {
          if (!state) return;

          if (!state.paused && playbackErrorTimer) {
            clearTimeout(playbackErrorTimer);
            playbackErrorTimer = null;
          }

          usePlayerStore.setState({
            isPlaying: !state.paused,
            currentTime: state.position,
            duration: state.duration,
          });

          if (
            state.paused &&
            state.position === 0 &&
            state.track_window.previous_tracks.length > 0 &&
            !isAdvancing
          ) {
            isAdvancing = true;
            setTimeout(() => {
              next();
              isAdvancing = false;
            }, 500);
          }
        });

        player.addListener("autoplay_failed", () => {
          sileo.warning({
            title: "Autoplay failed",
            description: "Click play to start listening.",
          });
        });

        // activateElement ensures playback can continue after transfer
        // from other Spotify Connect devices without being paused by
        // browser autoplay policies.
        void player.activateElement();

        void player.connect().then((success) => {
          if (!success) {
            sileo.error({
              title: "Failed to connect to Spotify",
              description:
                "Please check your internet connection and try again.",
            });
          }
        });

        setPlayer(player);
      })
      .catch(() => {
        sileo.error({
          title: "Spotify SDK load failed",
          description: "Could not load Spotify playback SDK.",
        });
      });

    return () => {
      isUnmounted = true;

      if (playbackErrorTimer) {
        clearTimeout(playbackErrorTimer);
      }

      if (localPlayer) {
        localPlayer.disconnect();
      }

      setPlayer(null);
      setDeviceId(null);
      setIsPremium(false);
      setSpotifyPremium(false);
      setSpotifyAuth(false);
    };
  }, [initialAccessToken]);

  return null;
};
