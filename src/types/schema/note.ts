import { z } from "zod";

export const CreateNoteSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(100),
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
