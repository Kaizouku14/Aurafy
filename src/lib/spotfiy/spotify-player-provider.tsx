"use client";

import { fetchFreshToken } from "@/lib/spotify-auth";
import { usePlayerStore } from "@/store/play-store";
import React from "react";
import { sileo } from "sileo";

export const SpotifyPlayerProvider = ({
  accessToken: initialAccessToken,
}: {
  accessToken: string;
}) => {
  React.useEffect(() => {
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
          fetchFreshToken()
            .then((freshToken) => {
              usePlayerStore.getState().setAccessToken(freshToken);
              cb(freshToken);
            })
            .catch(() => {
              const fallback = usePlayerStore.getState().accessToken;
              if (fallback) {
                cb(fallback);
              }
            });
        },
        volume: 0.5,
      });

      player.addListener("initialization_error", () => {
        sileo.error({
          title: "Spotify initialization failed",
          description: "Please try again later.",
        });
      });

      player.addListener("authentication_error", () => {
        fetchFreshToken()
          .then((freshToken) => {
            usePlayerStore.getState().setAccessToken(freshToken);
            console.log(
              "Refreshed token after auth error, SDK will retry automatically.",
            );
          })
          .catch(() => {
            sileo.error({
              title: "Spotify authentication failed",
              description: "Please log in again.",
            });

            usePlayerStore.getState().setIsPremium(false);
          });
      });

      player.addListener("account_error", () => {
        sileo.error({
          title: "Premium required",
          description: "Please upgrade to Premium to continue listening.",
        });
        usePlayerStore.getState().setIsPremium(false);
      });

      player.addListener("playback_error", () => {
        sileo.error({
          title: "Playback error",
          description: "Failed to play this track. Skipping...",
        });
      });

      player.addListener("ready", ({ device_id }) => {
        usePlayerStore.getState().setDeviceId(device_id);
      });

      player.addListener("not_ready", () => {
        sileo.warning({
          title: "Spotify player disconnected. Reconnecting...",
        });
        usePlayerStore.getState().setDeviceId(null);
      });

      let isAdvancing = false;
      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        usePlayerStore.getState().setIsPlaying(!state.paused);
        usePlayerStore.getState().setCurrentTime(state.position);
        usePlayerStore.getState().setDuration(state.duration);

        if (
          state.paused &&
          state.position === 0 &&
          state.track_window.previous_tracks.length > 0 &&
          !isAdvancing
        ) {
          isAdvancing = true;
          setTimeout(() => {
            usePlayerStore.getState().next();
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
      player.activateElement();

      player.connect().then((success) => {
        if (success) {
          sileo.success({
            title: "Spotify Web Playback SDK connected successfully.",
          });
        } else {
          sileo.error({
            title: "Failed to connect",
            description: "Please check your internet connection and try again.",
          });
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
