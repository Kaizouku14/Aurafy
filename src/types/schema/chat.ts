import z from "zod";
import { INTENT, MOOD } from "@/constants/chat";

export const userIdSchema = z.object({
  userId: z.string(),
});

export type UserId = z.infer<typeof userIdSchema>;

export const chatMetadataSchema = z.object({
  intent: z.enum(INTENT),
  mood: z.enum(MOOD).optional(),
  songTitle: z.string().optional().nullable(),
  artist: z.string().optional().nullable(),
});

export type ChatMetadata = z.infer<typeof chatMetadataSchema>;

export const saveChatExchangeSchema = userIdSchema.extend({
  userMessage: z.string(),
  assistantMessage: z.string(),
  metadata: chatMetadataSchema.optional(),
});

export type SaveChatExchange = z.infer<typeof saveChatExchangeSchema>;
