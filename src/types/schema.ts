import { INTENT, MOOD } from "@/constants/chat";
import z from "zod";

export const chatFormSchema = z.object({
  message: z.string(),
});

export type ChatForm = z.infer<typeof chatFormSchema>;

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
