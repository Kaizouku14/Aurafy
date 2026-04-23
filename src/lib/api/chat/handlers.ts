import {
  convertToModelMessages,
  generateText,
  Output,
  streamText,
  type UIMessage,
} from "ai";
import { groq } from "@/lib/ai/groq";
import { MODELS } from "@/lib/ai/models";
import { CONVERSATIONAL_SYSTEM_PROMPT, GET_MOOD_PROMPT } from "@/lib/ai/prompt";
import { INTENT_LABELS } from "@/constants/chat";
import type { ProviderId } from "@/types/music-provider";
import { generateMoodSchema } from "@/types/schema/chat";
import type { GenerateIntent, ChatMetadata } from "@/types/schema/chat";
import {
  handleArtistByProvider,
  handleMoodByProvider,
  handleSongByProvider,
  type ProviderUserLibrary,
} from "./music-provider";
import {
  buildRecentTopics,
  type loadChatHistory,
  saveChatExchange,
} from "./memory";
import { createTextWithTracksResponse } from "./response";

type ChatHistory = Awaited<ReturnType<typeof loadChatHistory>>;

const persistExchange = (
  userId: string,
  userText: string,
  assistantText: string,
  metadata?: ChatMetadata,
) => {
  saveChatExchange({
    userId,
    userMessage: userText,
    assistantMessage: assistantText,
    metadata,
  }).catch((err) => console.error("[persistExchange] Failed to save:", err));
};

export const handleMoodIntent = async (
  userId: string,
  userText: string,
  library: ProviderUserLibrary,
  provider: ProviderId,
): Promise<Response> => {
  const { output: mood } = await generateText({
    model: groq(MODELS.default),
    output: Output.object({ schema: generateMoodSchema }),
    prompt: GET_MOOD_PROMPT(userText),
    temperature: 0.2,
  });

  if (mood.confidence < 0.6) {
    const text = "Tell me more about how you're feeling";
    persistExchange(userId, userText, text, {
      intent: INTENT_LABELS.PLAY_MOOD!,
      mood: mood.mood,
    });
    return createTextWithTracksResponse(text);
  }

  const providerLabel = provider === "spotify" ? "Spotify" : "YouTube Music";

  try {
    const tracks = await handleMoodByProvider(
      provider,
      userId,
      mood.mood,
      library,
    );

    const text = `I can feel you're in a ${mood.mood} mood. Let me find you some songs on ${providerLabel}.`;
    persistExchange(userId, userText, text, {
      intent: INTENT_LABELS.PLAY_MOOD!,
      mood: mood.mood,
    });
    return createTextWithTracksResponse(text, tracks);
  } catch {
    const text = `I sense you're feeling ${mood.mood}, but I couldn't reach ${providerLabel} right now. Try again in a moment.`;
    persistExchange(userId, userText, text, {
      intent: INTENT_LABELS.PLAY_MOOD!,
      mood: mood.mood,
    });
    return createTextWithTracksResponse(text);
  }
};

export const handleSongIntent = async (
  userId: string,
  userText: string,
  intent: GenerateIntent,
  provider: ProviderId,
): Promise<Response> => {
  if (!intent.songTitle) {
    const text = "Which song would you like to play?";
    persistExchange(userId, userText, text, {
      intent: INTENT_LABELS.PLAY_SONG!,
    });
    return createTextWithTracksResponse(text);
  }

  const providerLabel = provider === "spotify" ? "Spotify" : "YouTube Music";

  try {
    const tracks = await handleSongByProvider(
      provider,
      userId,
      intent.songTitle,
      intent.artist,
    );
    const artistSuffix = intent.artist ? ` by ${intent.artist}` : "";

    if (!tracks.length) {
      return createTextWithTracksResponse(
        `Sorry, I couldn't find "${intent.songTitle}"${artistSuffix}.`,
      );
    }

    const text = `Playing "${intent.songTitle}"${artistSuffix} on ${providerLabel}`;
    persistExchange(userId, userText, text, {
      intent: INTENT_LABELS.PLAY_SONG!,
      songTitle: intent.songTitle,
      artist: intent.artist,
    });
    return createTextWithTracksResponse(text, tracks);
  } catch {
    return createTextWithTracksResponse(
      `I couldn't search ${providerLabel} right now. Try again in a moment.`,
    );
  }
};

export const handleArtistIntent = async (
  userId: string,
  userText: string,
  intent: GenerateIntent,
  provider: ProviderId,
): Promise<Response> => {
  if (!intent.artist) {
    return createTextWithTracksResponse("Which artist?");
  }

  const providerLabel = provider === "spotify" ? "Spotify" : "YouTube Music";

  try {
    const tracks = await handleArtistByProvider(
      provider,
      userId,
      intent.artist,
    );
    const text = `Here are popular songs by ${intent.artist} on ${providerLabel}.`;
    persistExchange(userId, userText, text, {
      intent: INTENT_LABELS.PLAY_ARTIST!,
      artist: intent.artist,
    });
    return createTextWithTracksResponse(text, tracks);
  } catch {
    return createTextWithTracksResponse(
      `I couldn't look up ${intent.artist} on ${providerLabel} right now. Try again in a moment.`,
    );
  }
};

export const handleConversation = async (
  userId: string,
  userText: string,
  messages: UIMessage[],
  history: ChatHistory,
  options?: {
    allowPlaybackOffers?: boolean;
  },
): Promise<Response> => {
  const recentTopics = buildRecentTopics(history);

  const result = streamText({
    model: groq(MODELS.default),
    system: CONVERSATIONAL_SYSTEM_PROMPT(recentTopics, options),
    temperature: 0.6,
    maxOutputTokens: 500,
    messages: [...history, ...(await convertToModelMessages(messages))],
    onFinish: async ({ text }) => {
      persistExchange(userId, userText, text, {
        intent: INTENT_LABELS.OTHERS!,
      });
    },
  });

  return result.toUIMessageStreamResponse();
};
