"use client";

import { fetchFreshToken } from "@/lib/spotify-auth";
import { usePlayerStore } from "@/store/play-store";
import React from "react";

export const SpotifyPlayerProvider = ({
  accessToken: initialAccessToken,
}: {
  accessToken: string;
}) => {
  React.useEffect(() => {
    // Store the initial access token and mark as premium immediately
    usePlayerStore.getState().setAccessToken(initialAccessToken);
    usePlayerStore.getState().setIsPremium(true);

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Aurafy Player",
        getOAuthToken: (cb) => {
          // The SDK calls this whenever it needs a token (including on expiry).
          // Fetch a fresh token from our API route which auto-refreshes if expired.
          fetchFreshToken()
            .then((freshToken) => {
              // Keep the store in sync so REST API calls also use the fresh token
              usePlayerStore.getState().setAccessToken(freshToken);
              cb(freshToken);
            })
            .catch((err) => {
              console.error("Failed to get fresh Spotify token for SDK:", err);
              // Fall back to whatever token we have in the store
              const fallback = usePlayerStore.getState().accessToken;
              if (fallback) {
                cb(fallback);
              }
            });
        },
        volume: 0.5,
      });

      // Required error listeners per SDK docs
      player.addListener("initialization_error", ({ message }) => {
        console.error("Spotify SDK initialization error:", message);
      });

      player.addListener("authentication_error", ({ message }) => {
        console.error("Spotify SDK authentication error:", message);
        // Token is invalid — attempt to refresh and reconnect
        fetchFreshToken()
          .then((freshToken) => {
            usePlayerStore.getState().setAccessToken(freshToken);
            console.log(
              "Refreshed token after auth error, SDK will retry automatically.",
            );
          })
          .catch((err) => {
            console.error("Could not refresh token after auth error:", err);
            usePlayerStore.getState().setIsPremium(false);
          });
      });

      player.addListener("account_error", ({ message }) => {
        console.error("Spotify SDK account error (Premium required):", message);
        usePlayerStore.getState().setIsPremium(false);
      });

      player.addListener("playback_error", ({ message }) => {
        console.error("Spotify SDK playback error:", message);
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Spotify SDK ready with Device ID:", device_id);
        usePlayerStore.getState().setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Spotify SDK device offline:", device_id);
        usePlayerStore.getState().setDeviceId(null);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        usePlayerStore.getState().setIsPlaying(!state.paused);
        usePlayerStore.getState().setCurrentTime(state.position);
        usePlayerStore.getState().setDuration(state.duration);
      });

      player.addListener("autoplay_failed", () => {
        console.warn(
          "Spotify SDK autoplay failed — user interaction required.",
        );
      });

      // activateElement ensures playback can continue after transfer
      // from other Spotify Connect devices without being paused by
      // browser autoplay policies.
      player.activateElement();

      player.connect().then((success) => {
        if (success) {
          console.log("Spotify Web Playback SDK connected successfully.");
        } else {
          console.error("Spotify Web Playback SDK failed to connect.");
        }
      });

      usePlayerStore.getState().setPlayer(player);
    };

    return () => {
      const currentPlayer = usePlayerStore.getState().player;
      if (currentPlayer) {
        currentPlayer.disconnect();
        usePlayerStore.getState().setPlayer(null);
        usePlayerStore.getState().setDeviceId(null);
      }
    };
  }, [initialAccessToken]);

  return null;
};
