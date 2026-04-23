import type { UIMessage } from "ai";
import { getSession } from "@/server/better-auth";
import { getSpotifyToken } from "@/server/better-auth/server";
import { INTENT_LABELS } from "@/constants/chat";
import type { ProviderId } from "@/types/music-provider";
import { classifyIntent } from "@/lib/api/chat/intent";
import { loadChatHistory } from "@/lib/api/chat/memory";
import {
  fetchUserLibraryByProvider,
  resolveChatProvider,
} from "@/lib/api/chat/music-provider";
import {
  handleMoodIntent,
  handleSongIntent,
  handleArtistIntent,
  handleConversation,
} from "@/lib/api/chat/handlers";

export const POST = async (req: Request) => {
  const [session, reqBody] = await Promise.all([
    getSession(),
    req.json() as Promise<{
      messages: UIMessage[];
      providerState?: {
        preferredProvider?: ProviderId;
        hasSpotifyAuth?: boolean;
        isSpotifyPremium?: boolean;
      };
    }>,
  ]);
  const { messages } = reqBody;

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: userId } = session.user;
  const lastMessage = messages[messages.length - 1];
  const userText =
    lastMessage?.parts?.find((p) => p.type === "text")?.text ?? "";
  const previousAssistantMessage =
    messages
      .filter((m) => m.role === "assistant")
      .pop()
      ?.parts?.find((p) => p.type === "text")?.text ?? "";

  if (!userText.trim()) {
    return new Response("Bad Request", { status: 400 });
  }

  const hasClientProviderState = Boolean(reqBody.providerState);
  const spotifyToken = hasClientProviderState
    ? null
    : await getSpotifyToken(userId).catch(() => null);

  const resolvedProviderState = {
    preferredProvider:
      reqBody.providerState?.preferredProvider ??
      (spotifyToken ? ("spotify" as ProviderId) : ("ytmusic" as ProviderId)),
    hasSpotifyAuth:
      reqBody.providerState?.hasSpotifyAuth ?? Boolean(spotifyToken),
    isSpotifyPremium: reqBody.providerState?.isSpotifyPremium ?? false,
  };

  const provider = resolveChatProvider({
    preferredProvider: resolvedProviderState.preferredProvider,
    hasSpotifyAuth: resolvedProviderState.hasSpotifyAuth,
    isSpotifyPremium: resolvedProviderState.isSpotifyPremium,
  });

  const history = await loadChatHistory({ userId });

  if (!resolvedProviderState.isSpotifyPremium) {
    return handleConversation(userId, userText, messages, history);
  }

  const [intent, library] = await Promise.all([
    classifyIntent(userText, previousAssistantMessage),
    fetchUserLibraryByProvider(userId, provider),
  ]);

  switch (intent.intent) {
    case INTENT_LABELS.PLAY_MOOD:
      return handleMoodIntent(userId, userText, library, provider);
    case INTENT_LABELS.PLAY_SONG:
      return handleSongIntent(userId, userText, intent, provider);
    case INTENT_LABELS.PLAY_ARTIST:
      return handleArtistIntent(userId, userText, intent, provider);
    default:
      return handleConversation(userId, userText, messages, history);
  }
};
