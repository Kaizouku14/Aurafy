"use client";

import React from "react";
import Conversation from "./_components/chat/conversation";
import MusicList from "./_components/music/music-list";
import type { SpotifyTrack } from "@/types/spotify";

const Page = () => {
  const [tracks, setTracks] = React.useState<SpotifyTrack[]>([]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-start justify-center gap-4 pt-4">
      <Conversation onTracksReceived={setTracks} />
      <MusicList tracks={tracks} />
    </div>
  );
};

export default Page;
