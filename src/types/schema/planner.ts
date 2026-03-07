import { z } from "zod";

const subjectEntrySchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  examDate: z.date({ required_error: "Exam date is required" }),
});

export const CreatePlanSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  hoursPerDay: z.number().min(1).max(16),
  subjects: z.array(subjectEntrySchema).min(1, "Add at least one subject"),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;
