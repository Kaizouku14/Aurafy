import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { MODELS } from "./models";
import { GENERATE_STUDY_PLAN_PROMPT } from "./prompt";

const studyBlockSchema = z.object({
  time: z.string().describe("Start time, e.g. '09:00'"),
  subject: z.string().describe("The subject to study"),
  activity: z.string().describe("What to do, e.g. 'Review flashcards', 'Read chapter 3', 'Practice problems'"),
  duration: z.number().describe("Duration in minutes"),
});

const dayScheduleSchema = z.object({
  date: z.string().describe("ISO date string YYYY-MM-DD"),
  blocks: z.array(studyBlockSchema).describe("Ordered list of study blocks for this day"),
});

export async function generateStudyPlan(
  subjects: { name: string; examDate: string }[],
  startDate: string,
  endDate: string,
  hoursPerDay: number
) {
  const subjectsStr = subjects
    .map((s) => `- ${s.name} (exam: ${s.examDate})`)
    .join("\n");

  const { object } = await generateObject({
    model: groq(MODELS.default),
    schema: z.object({
      days: z.array(dayScheduleSchema).describe("The full study schedule, one entry per day"),
    }),
    prompt: GENERATE_STUDY_PLAN_PROMPT(subjectsStr, startDate, endDate, hoursPerDay),
  });

  return object.days;
}
