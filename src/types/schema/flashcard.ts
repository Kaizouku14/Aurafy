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
