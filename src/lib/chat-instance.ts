import { Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { trackSchema, type Track } from "@/types/schema/chat";
import { usePlayerStore } from "@/store/play-store";
import { useMusicProviderStore } from "@/store/music-provider-store";

export const sharedChat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ body, messages }) => {
      const { activeProvider, hasSpotifyAuth, isSpotifyPremium } =
        useMusicProviderStore.getState();

      return {
        body: {
          ...(body ?? {}),
          messages,
          providerState: {
            preferredProvider: activeProvider,
            hasSpotifyAuth,
            isSpotifyPremium,
          },
        },
      };
    },
  }),
  dataPartSchemas: { tracks: trackSchema },
  onData: (dataPart) => {
    if (dataPart.type === "data-tracks") {
      usePlayerStore.getState().setTracks(dataPart.data as Track[]);
    }
  },
});
