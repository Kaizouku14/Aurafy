"use client";

import { usePlayerStore } from "@/store/play-store";
import React from "react";
import { sileo } from "sileo";
import { fetchFreshToken } from "./spotify-auth";

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

    let isAdvancing = false;

    setAccessToken(initialAccessToken);
    setIsPremium(true);

    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
      return;
    }

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
          });
      });

      player.addListener("account_error", () => {
        sileo.error({
          title: "Premium required",
          description: "Please upgrade to Premium to continue listening.",
        });
        setIsPremium(false);
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
      player.activateElement();

      player.connect().then((success) => {
        if (!success) {
          sileo.error({
            title: "Failed to connect to Spotify",
            description: "Please check your internet connection and try again.",
          });
        }
      });

      setPlayer(player);
    };

    return () => {
      const currentPlayer = usePlayerStore.getState().player;
      if (currentPlayer) {
        currentPlayer.disconnect();
        setPlayer(null);
        setDeviceId(null);
      }

      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [initialAccessToken]);

  return null;
};
