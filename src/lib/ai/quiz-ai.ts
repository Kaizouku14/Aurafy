import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { MODELS } from "./models";
import type { QuizType } from "@/types/quiz/schema";

const mcqSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string().min(10),
      options: z.array(z.string().min(1)).length(4),
      correctAnswer: z.string().min(1),
      explanation: z.string().min(1),
      difficulty: z.enum(["medium", "hard"]),
    }),
  ),
});

const tfSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string().min(10),
      options: z.tuple([z.literal("True"), z.literal("False")]),
      correctAnswer: z.enum(["True", "False"]),
      explanation: z.string().min(1),
      difficulty: z.enum(["medium", "hard"]),
    }),
  ),
});

const identificationSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string().min(10),
      options: z.null(),
      correctAnswer: z.string().min(1),
      explanation: z.string().min(1),
      difficulty: z.enum(["medium", "hard"]),
    }),
  ),
});

const buildPrompt = (notes: string, quizType: QuizType, count: number) => {
  const common = [
    "You are an expert assessment designer.",
    `Generate exactly ${count} questions based only on the provided notes.`,
    "Target medium-to-hard difficulty.",
    "Every question must include a difficulty field with value 'medium' or 'hard'.",
    "Avoid trivial recall wording.",
    "Every question must be unambiguous and answerable from the notes.",
    "Include concise explanation for each answer.",
  ].join("\n");

  const typeRule =
    quizType === "multiple_choice"
      ? [
          "Question type: multiple choice.",
          "Each question must have exactly 4 options.",
          "Distractors must be plausible and related to the topic but still incorrect.",
          "Do not use 'all of the above' or 'none of the above'.",
          "The correctAnswer must exactly match one of the options.",
        ].join("\n")
      : quizType === "true_false"
        ? [
            "Question type: true/false.",
            "Use options [\"True\", \"False\"] for every question.",
            "Balance true and false answers as much as possible.",
            "Avoid obvious wording clues.",
          ].join("\n")
        : [
            "Question type: identification.",
            "No options allowed; set options to null.",
            "correctAnswer should be short and exact (term, phrase, or value).",
            "Questions should require precise recall from the notes.",
          ].join("\n");

  return `${common}\n${typeRule}\n\nNotes:\n${notes}`;
};

const normalize = (value: string) => value.trim().toLowerCase();

const validateMcq = (questions: z.infer<typeof mcqSchema>["questions"]) => {
  return questions.filter((q) => {
    const normalized = q.options.map(normalize);
    const uniqueCount = new Set(normalized).size;
    const answer = normalize(q.correctAnswer);
    return uniqueCount === 4 && normalized.includes(answer);
  });
};

export const generateQuizFromNotes = async (
  notes: string,
  quizType: QuizType,
  count = 10,
) => {
  if (quizType === "multiple_choice") {
    const { object } = await generateObject({
      model: groq(MODELS.default),
      schema: mcqSchema,
      prompt: buildPrompt(notes, quizType, count),
    });

    return validateMcq(object.questions).slice(0, count);
  }

  if (quizType === "true_false") {
    const { object } = await generateObject({
      model: groq(MODELS.default),
      schema: tfSchema,
      prompt: buildPrompt(notes, quizType, count),
    });

    return object.questions.slice(0, count).map((question) => ({
      ...question,
      options: ["True", "False"] as ["True", "False"],
    }));
  }

  const { object } = await generateObject({
    model: groq(MODELS.default),
    schema: identificationSchema,
    prompt: buildPrompt(notes, quizType, count),
  });

  return object.questions.slice(0, count);
};
