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

export const saveChatExchange = async (input: SaveChatExchange) => {
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

export const buildRecentTopics = (
  history: Awaited<ReturnType<typeof loadChatHistory>>,
) => {
  if (history.length === 0) return "No previous conversations.";

  const moods = new Set<string>();
  const songs = new Set<string>();
  const artists = new Set<string>();
  const recentMessages: string[] = [];

  for (const msg of history) {
    if (msg.role === ROLES_LABELS.ASSISTANT && msg.metadata) {
      try {
        const meta = JSON.parse(msg.metadata) as ChatMetadata;
        if (meta.intent === INTENT_LABELS.PLAY_MOOD && meta.mood) {
          moods.add(meta.mood);
        } else if (meta.intent === INTENT_LABELS.PLAY_SONG && meta.songTitle) {
          songs.add(
            meta.artist
              ? `"${meta.songTitle}" by ${meta.artist}`
              : `"${meta.songTitle}"`,
          );
        } else if (meta.intent === INTENT_LABELS.PLAY_ARTIST && meta.artist) {
          artists.add(meta.artist);
        }
      } catch {
        // skip malformed metadata
      }
    } else if (msg.role === ROLES_LABELS.USER && msg.content) {
      recentMessages.push(msg.content);
    }
  }

  const parts: string[] = [];

  if (moods.size > 0) parts.push(`Moods: ${[...moods].join(", ")}`);
  if (songs.size > 0) parts.push(`Songs: ${[...songs].join(", ")}`);
  if (artists.size > 0) parts.push(`Artists: ${[...artists].join(", ")}`);

  if (recentMessages.length > 0) {
    parts.push(
      `Recent requests:\n${recentMessages.map((m) => `  - "${m}"`).join("\n")}`,
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
