import { z } from "zod";

export const CreateDeckSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(100, "Subject is too long"),
  examDate: z.date({
    required_error: "A valid exam or deadline date is required.",
  }),
  notes: z
    .string()
    .max(10000, "Notes cannot exceed 10,000 characters.")
    .optional(),
});

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

export const CardDraftSchema = z.object({
  front: z
    .string()
    .trim()
    .min(1, "The card question is required.")
    .max(2000, "The card question is too long (max 2,000 characters)."),
  back: z
    .string()
    .trim()
    .min(1, "The card answer is required.")
    .max(5000, "The card answer is too long (max 5,000 characters)."),
});

export type CardDraftInput = z.infer<typeof CardDraftSchema>;
