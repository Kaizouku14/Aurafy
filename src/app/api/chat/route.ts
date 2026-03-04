import {
  buildRecentTopics,
  loadChatHistory,
  saveChatExchange,
} from "@/lib/api/chat/memory";
import { generateIntentSchema, generateMoodSchema } from "@/types/schema";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  generateText,
  Output,
  streamText,
  type UIMessage,
} from "ai";
import { groq } from "@/lib/groq";
import { MODELS } from "@/lib/models";
import {
  CONVERSATIONAL_SYSTEM_PROMPT,
  GET_INTENT_PROMPT,
  GET_MOOD_PROMPT,
} from "@/lib/prompt";
import { getSession } from "@/server/better-auth/server";
import { INTENT_LABELS } from "@/constants/chat";

export const maxDuration = 30;

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

  const [history, { output: intent }] = await Promise.all([
    loadChatHistory({ userId }),
    generateText({
      model: groq(MODELS.default),
      output: Output.object({ schema: generateIntentSchema }),
      prompt: GET_INTENT_PROMPT(userText),
      temperature: 0.1,
    }),
  ]);

  if (intent.intent === INTENT_LABELS.PLAY_MOOD) {
    const { output: mood } = await generateText({
      model: groq(MODELS.default),
      output: Output.object({ schema: generateMoodSchema }),
      prompt: GET_MOOD_PROMPT(userText),
      temperature: 0.2,
    });

    const assistantText =
      mood.confidence < 0.6
        ? "Tell me more about how you're feeling"
        : `I can feel you're in a ${mood.mood} mood. Let me find you some songs.`;

    void saveChatExchange({
      userId,
      userMessage: userText,
      assistantMessage: assistantText,
      metadata: { intent: INTENT_LABELS.PLAY_MOOD, mood: mood.mood },
    });

    const textId = generateId();
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: "start" });
        writer.write({ type: "text-start", id: textId });
        writer.write({ type: "text-delta", id: textId, delta: assistantText });
        writer.write({ type: "text-end", id: textId });
        writer.write({
          type: "data-mood",
          data: { mood },
        });
        writer.write({ type: "finish" });
      },
    });

    return createUIMessageStreamResponse({
      stream,
    });
  }

  if (intent.intent === INTENT_LABELS.PLAY_SONG) {
    const assistantText =
      intent.songTitle && intent.artist
        ? `Playing "${intent.songTitle}" by ${intent.artist}`
        : "Which song would you like to play?";

    void saveChatExchange({
      userId,
      userMessage: userText,
      assistantMessage: assistantText,
      metadata: {
        intent: INTENT_LABELS.PLAY_SONG,
        songTitle: intent.songTitle,
        artist: intent.artist,
      },
    });

    const textId = generateId();
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: "start" });
        writer.write({ type: "text-start", id: textId });
        writer.write({ type: "text-delta", id: textId, delta: assistantText });
        writer.write({ type: "text-end", id: textId });

        if (intent.songTitle && intent.artist) {
          writer.write({
            type: "data-song",
            data: {
              songTitle: intent.songTitle,
              artist: intent.artist,
            },
          });
        }

        writer.write({ type: "finish" });
      },
    });

    return createUIMessageStreamResponse({
      stream,
    });
  }

  const messageHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata,
  }));

  const recentTopics = buildRecentTopics(messageHistory);

  const result = streamText({
    model: groq(MODELS.default),
    system: CONVERSATIONAL_SYSTEM_PROMPT(recentTopics),
    temperature: 0.6,
    maxOutputTokens: 200,
    messages: [...messageHistory, ...(await convertToModelMessages(messages))],
    onFinish: async ({ text }) => {
      void saveChatExchange({
        userId,
        userMessage: userText,
        assistantMessage: text,
        metadata: { intent: INTENT_LABELS.OTHER! },
      });
    },
  });

  return result.toUIMessageStreamResponse();
};
