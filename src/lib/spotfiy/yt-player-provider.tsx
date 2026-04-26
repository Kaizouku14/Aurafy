"use client";

import React, { useEffect, useRef } from "react";
import YouTubePlayer from "youtube-player";
import { usePlayerStore } from "@/store/play-store";
import { sileo } from "sileo";

export const YouTubePlayerProvider = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container?.isConnected) return;

    const mountNode = document.createElement("div");
    container.appendChild(mountNode);

    let isUnmounted = false;

    const player = YouTubePlayer(mountNode, {
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        iv_load_policy: 3,
      },
    });

    usePlayerStore.getState().setYtPlayer(player);

    player.on("stateChange", (event) => {
      const state = event.data;
      // 1 = playing, 2 = paused, 0 = ended
      if (state === 1) {
        usePlayerStore.getState().setIsPlaying(true);
      } else if (state === 2) {
        usePlayerStore.getState().setIsPlaying(false);
      } else if (state === 0) {
        usePlayerStore.getState().next();
      }
    });

    player.on("error", (event) => {
      const code = (event as { data?: number }).data;
      const reason =
        code === 2
          ? "invalid video id"
          : code === 5
            ? "browser playback error"
            : code === 100
              ? "video was removed or is private"
              : code === 101 || code === 150
                ? "owner blocked embedded playback"
                : "unknown YouTube error";

      sileo.warning({
        title: "Track not playable on YouTube Music",
        description: `Skipping track (${reason}).`,
      });

      usePlayerStore.getState().next();
    });

    const interval = setInterval(() => {
      void (async () => {
        if (isUnmounted) return;
        try {
          const state = await player.getPlayerState();
          if (isUnmounted) return;
          if ((state as number) === 1) {
            const current = await player.getCurrentTime();
            const duration = await player.getDuration();
            if (isUnmounted) return;
            if (current)
              usePlayerStore.getState().setCurrentTime(current * 1000);
            if (duration && duration > 0)
              usePlayerStore.getState().setDuration(duration * 1000);
          }
        } catch {
          // ignore errors if player is not ready
        }
      })();
    }, 500);

    return () => {
      isUnmounted = true;
      clearInterval(interval);

      void player.destroy().catch(() => {
        // best-effort teardown when route transitions race with iframe setup
      });

      if (mountNode.parentNode === container) {
        container.removeChild(mountNode);
      }

      usePlayerStore.getState().setYtPlayer(null);
    };
  }, []);

  return <div ref={containerRef} className="hidden" aria-hidden="true" />;
};
