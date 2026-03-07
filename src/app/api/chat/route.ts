import type { UIMessage } from "ai";
import { getSession } from "@/server/better-auth";
import { INTENT_LABELS } from "@/constants/chat";
import { classifyIntent } from "@/lib/api/chat/intent";
import { loadChatHistory } from "@/lib/api/chat/memory";
import { fetchUserLibrary } from "@/lib/api/chat/spotify";
import {
  handleMoodIntent,
  handleSongIntent,
  handleArtistIntent,
  handleConversation,
} from "@/lib/api/chat/handlers";

export const POST = async (req: Request) => {
  const [session, { messages }] = await Promise.all([
    getSession(),
    req.json() as Promise<{ messages: UIMessage[] }>,
  ]);

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id: userId } = session.user;
  const lastMessage = messages[messages.length - 1];
  const userText =
    lastMessage?.parts?.find((p) => p.type === "text")?.text ?? "";
  const previousAssistantMessage = messages
    .filter((m) => m.role === "assistant")
    .pop()
    ?.parts?.find((p) => p.type === "text")?.text ?? "";

  if (!userText.trim()) {
    return new Response("Bad Request", { status: 400 });
  }

  const [intent, history, library] = await Promise.all([
    classifyIntent(userText, previousAssistantMessage),
    loadChatHistory({ userId }),
    fetchUserLibrary(userId),
  ]);

  switch (intent.intent) {
    case INTENT_LABELS.PLAY_MOOD:
      return handleMoodIntent(userId, userText, library);
    case INTENT_LABELS.PLAY_SONG:
      return handleSongIntent(userId, userText, intent);
    case INTENT_LABELS.PLAY_ARTIST:
      return handleArtistIntent(userId, userText, intent);
    default:
      return handleConversation(userId, userText, messages, history);
  }
};
