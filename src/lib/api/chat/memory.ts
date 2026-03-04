import { generateID, getErrorMessage } from "@/lib/utils";
import { db } from "@/server/db";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { chat } from "@/server/db/schema";
import type { SaveChatExchange, UserId } from "@/types/schema/chat";
import { ROLES_LABELS } from "@/constants/role";

export const loadChatHistory = async ({
  userId,
  limit = 30,
}: UserId & { limit?: number }) => {
  try {
    const history = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt))
      .limit(limit);

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
