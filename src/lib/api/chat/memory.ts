import { generateID, getErrorMessage } from "@/lib/utils";
import { db } from "@/server/db";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { chat } from "@/server/db/schema";
import type {
  ChatMetadata,
  SaveChatExchange,
  UserId,
} from "@/types/schema/chat";
import { ROLES_LABELS } from "@/constants/role";
import { INTENT_LABELS } from "@/constants/chat";

export const loadChatHistory = async ({ userId }: UserId) => {
  try {
    const history = await db
      .select({
        role: chat.role,
        content: chat.content,
        metadata: chat.metadata,
      })
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt))
      .limit(30);

    return history.reverse();
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};

export const saveChatExchange = async (
  input: SaveChatExchange,
): Promise<void> => {
  try {
    await db.insert(chat).values([
      {
        id: generateID(),
        userId: input.userId,
        role: ROLES_LABELS.USER,
        content: input.userMessage,
      },
      {
        id: generateID(),
        userId: input.userId,
        role: ROLES_LABELS.ASSISTANT,
        content: input.assistantMessage,
        metadata: JSON.stringify(input.metadata),
      },
    ]);
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};

/**
 * Builds a concise summary string from DB chat history for the system prompt.
 * Extracts mood preferences, song requests, and recent conversation topics
 * so the AI has context without re-reading raw messages.
 */
export const buildRecentTopics = (
  history: Awaited<ReturnType<typeof loadChatHistory>>,
): string => {
  if (history.length === 0) return "No previous conversations.";

  const moods: string[] = [];
  const songs: string[] = [];
  const recentMessages: string[] = [];

  for (const msg of history) {
    if (msg.role === ROLES_LABELS.ASSISTANT && msg.metadata) {
      try {
        const meta = JSON.parse(msg.metadata) as ChatMetadata;

        if (meta.intent === INTENT_LABELS.PLAY_MOOD && meta.mood) {
          moods.push(meta.mood);
        }

        if (meta.intent === INTENT_LABELS.PLAY_SONG && meta.songTitle) {
          const songEntry = meta.artist
            ? `"${meta.songTitle}" by ${meta.artist}`
            : `"${meta.songTitle}"`;
          songs.push(songEntry);
        }
      } catch {
        // skip malformed metadata
      }
    }

    // Collect recent user messages as topic hints
    if (msg.role === ROLES_LABELS.USER) {
      recentMessages.push(msg.content);
    }
  }

  const parts: string[] = [];

  if (moods.length > 0) {
    const uniqueMoods = [...new Set(moods)];
    parts.push(`- Recent moods: ${uniqueMoods.join(", ")}`);
  }

  if (songs.length > 0) {
    const uniqueSongs = [...new Set(songs)].slice(-5); // last 5 songs
    parts.push(`- Recent song requests: ${uniqueSongs.join(", ")}`);
  }

  // Include the last 5 user messages as topic context
  const recentTopics = recentMessages.slice(-5);
  if (recentTopics.length > 0) {
    parts.push(
      `- Recent topics the user discussed:\n${recentTopics.map((m) => `  - "${m}"`).join("\n")}`,
    );
  }

  return parts.length > 0
    ? parts.join("\n")
    : "No notable context from previous conversations.";
};

export const clearChatHistory = async (input: UserId): Promise<void> => {
  try {
    await db.delete(chat).where(eq(chat.userId, input.userId));
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: getErrorMessage(error),
    });
  }
};
