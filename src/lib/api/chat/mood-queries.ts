import { generateText, Output } from "ai";
import { groq } from "@/lib/ai/groq";
import { MODELS } from "@/lib/ai/models";
import { GET_MOOD_QUERIES_PROMPT } from "@/lib/ai/prompt";
import { MOOD_MAP, type Mood } from "@/constants/chat";
import { generateMoodQueriesSchema } from "@/types/schema/chat";

interface GenerateMoodQueriesInput {
  userText: string;
  mood: Mood;
  artistHints: string[];
  recentTopics?: string;
}

const buildContext = ({
  artistHints,
  recentTopics,
}: Pick<GenerateMoodQueriesInput, "artistHints" | "recentTopics">): string => {
  const hints: string[] = [];

  if (artistHints.length > 0) {
    hints.push(
      `Known favorite/requested artists: ${artistHints.slice(0, 6).join(", ")}`,
    );
  }

  if (recentTopics && recentTopics !== "No previous conversations.") {
    hints.push(`Recent chat context:\n${recentTopics}`);
  }

  return hints.length > 0 ? hints.join("\n\n") : "No additional context.";
};

export const generateMoodQueries = async ({
  userText,
  mood,
  artistHints,
  recentTopics,
}: GenerateMoodQueriesInput): Promise<string[]> => {
  try {
    const { output } = await generateText({
      model: groq(MODELS.mood),
      output: Output.object({ schema: generateMoodQueriesSchema }),
      prompt: GET_MOOD_QUERIES_PROMPT(
        userText,
        mood,
        buildContext({ artistHints, recentTopics }),
      ),
      temperature: 0.4,
    });

    const queries = output.queries
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (queries.length < 3) {
      throw new Error("Too few mood queries");
    }

    return queries.slice(0, 4);
  } catch (error) {
    console.error("[generateMoodQueries] Falling back to genre map:", error);
    const { genres } = MOOD_MAP[mood];
    return [...genres];
  }
};