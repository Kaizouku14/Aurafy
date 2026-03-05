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

export const generateIntentSchema = z.object({
  intent: z.enum(INTENT),
  songTitle: z.string().nullable(),
  artist: z.string().nullable(),
});

export type GenerateIntent = z.infer<typeof generateIntentSchema>;

export const generateMoodSchema = z.object({
  mood: z.enum(MOOD),
  energy: z.number().min(0).max(1),
  valence: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
});

export type GenerateMood = z.infer<typeof generateMoodSchema>;

export const trackSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    artist: z.string(),
    album: z.string(),
    cover: z.string().nullable(),
    duration: z.number(),
    uri: z.string(),
    previewUrl: z.string().nullable(),
  }),
);

export type Track = z.infer<typeof trackSchema>;
