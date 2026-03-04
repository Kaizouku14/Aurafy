import z from "zod";
import { INTENT, MOOD } from "@/constants/chat";

export const userIdSchema = z.object({
  userId: z.string(),
});

export type UserId = z.infer<typeof userIdSchema>;

export const saveChatExchangeSchema = userIdSchema.extend({
  userMessage: z.string(),
  assistantMessage: z.string(),
  metadata: z
    .object({
      intent: z.enum(INTENT),
      mood: z.enum(MOOD).optional(),
      songTitle: z.string().optional(),
      artist: z.string().optional(),
    })
    .optional(),
});

export type SaveChatExchange = z.infer<typeof saveChatExchangeSchema>;
