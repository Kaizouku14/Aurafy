import { INTENT_LABELS } from "@/constants/chat";
import { groq } from "@/lib/groq";
import { MODELS } from "@/lib/models";
import {
  CONVERSATIONAL_SYSTEM_PROMPT,
  GET_INTENT_PROMPT,
  GET_MOOD_PROMPT,
} from "@/lib/prompt";
import {
  generateIntentSchema,
  generateMoodSchema,
  type ChatForm,
  type ChatResponse,
} from "@/types/schema";
import { TRPCError } from "@trpc/server";
import { generateText, Output } from "ai";

export const processMessage = async (
  input: ChatForm,
): Promise<ChatResponse> => {
  try {
    const { message, previousMessages } = input;

    const { output } = await generateText({
      model: groq(MODELS.default),
      output: Output.object({ schema: generateIntentSchema }),
      prompt: GET_INTENT_PROMPT(message),
      temperature: 0.1,
    });

    if (output.intent === INTENT_LABELS.PLAY_MOOD) {
      const { output: mood } = await generateText({
        model: groq(MODELS.default),
        output: Output.object({ schema: generateMoodSchema }),
        prompt: GET_MOOD_PROMPT(message),
        temperature: 0.2,
      });

      if (mood.confidence < 0.6) {
        return {
          type: "other",
          text: "Tell me more about how you're feeling",
        };
      }

      return {
        type: "play_mood",
        text: `I can feel you're in a ${mood.mood} mood. Let me find some music for you`,
        mood,
      };
    }

    if (output.intent === INTENT_LABELS.PLAY_SONG) {
      if (!output.songTitle || !output.artist) {
        return {
          type: "other",
          text: "Which song would you like to play?",
        };
      }

      return {
        type: "play_song",
        text: `Playing "${output.songTitle}" by ${output.artist}`,
        songTitle: output.songTitle,
        artist: output.artist,
      };
    }

    const { text } = await generateText({
      model: groq(MODELS.default),
      system: CONVERSATIONAL_SYSTEM_PROMPT,
      temperature: 0.6,
      maxOutputTokens: 100,
      messages: [...previousMessages, { role: "user", content: message }],
    });

    return {
      type: "other",
      text,
    };
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An error occurred while processing the message",
    });
  }
};
