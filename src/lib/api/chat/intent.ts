import { generateText, Output } from "ai";
import { groq } from "@/lib/ai/groq";
import { MODELS } from "@/lib/ai/models";
import { GET_INTENT_PROMPT } from "@/lib/ai/prompt";
import { generateIntentSchema, type GenerateIntent } from "@/types/schema/chat";
import { INTENT_LABELS } from "@/constants/chat";

const FALLBACK_INTENT: GenerateIntent = {
  intent: INTENT_LABELS.OTHERS!,
  songTitle: null,
  artist: null,
};

export const classifyIntent = async (
  userText: string,
  previousAssistantMessage: string = "",
): Promise<GenerateIntent> => {
  try {
    const { output } = await generateText({
      model: groq(MODELS.default),
      output: Output.object({ schema: generateIntentSchema }),
      prompt: GET_INTENT_PROMPT(userText, previousAssistantMessage),
      temperature: 0.1,
    });
    return output;
  } catch (error) {
    console.error("[classifyIntent] Failed, falling back to conversational:", error);
    return FALLBACK_INTENT;
  }
};
