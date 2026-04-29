import { type NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSession } from "@/server/better-auth";
import { generateQuizFromNotes } from "@/lib/ai/quiz-ai";
import { createQuizQuestions, createQuizSet } from "@/lib/api/quiz/queries";
import { quizTypeSchema } from "@/types/quiz/schema";

export const runtime = "nodejs";

type PdfParseResult = {
  text: string;
  numpages: number;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse") as (
  buffer: Buffer,
) => Promise<PdfParseResult>;

const extractAndSampleChunks = (fullText: string, maxChars = 10000): string => {
  const paragraphs = fullText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 60);

  if (paragraphs.length === 0) {
    return fullText.slice(0, maxChars);
  }

  let sampledText = "";
  let currentLength = 0;

  for (const paragraph of paragraphs) {
    if (currentLength + paragraph.length > maxChars) break;
    sampledText += paragraph + "\n\n";
    currentLength += paragraph.length + 2;
  }

  return sampledText.trim();
};

const calculateMaxQuestions = (contentLength: number): number => {
  // Estimate: ~200 chars needed per quality question
  if (contentLength < 1000) return 5;
  if (contentLength < 2000) return 10;
  if (contentLength < 5000) return 20;
  if (contentLength < 8000) return 30;
  return 40;
};

type QuizQuestionPayload = {
  prompt: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string;
  difficulty?: "medium" | "hard";
};

const ensureDifficulty = (
  questions: QuizQuestionPayload[],
): Array<
  Omit<QuizQuestionPayload, "difficulty"> & { difficulty: "medium" | "hard" }
> => {
  return questions.map((question) => ({
    ...question,
    difficulty: question.difficulty ?? "hard",
  }));
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subject = formData.get("subject") as string | null;
    const quizTypeRaw = formData.get("quizType") as string | null;
    const requestedCountRaw = formData.get("questionCount") as string | null;
    const fallbackNotes = formData.get("notes") as string | null;

    if (!subject || !quizTypeRaw) {
      return NextResponse.json(
        { error: "Missing required fields (subject, quizType)." },
        { status: 400 },
      );
    }

    const parsedQuizType = quizTypeSchema.safeParse(quizTypeRaw);
    if (!parsedQuizType.success) {
      return NextResponse.json(
        { error: "Invalid quiz type." },
        { status: 400 },
      );
    }

    const requestedCount = requestedCountRaw ? Number(requestedCountRaw) : 10;

    let finalNotes = fallbackNotes ?? "";

    if (file) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { error: "Uploaded file must be a PDF." },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const pdfData = await pdfParse(buffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length < 80) {
          return NextResponse.json(
            {
              error:
                "Could not extract sufficient text from this PDF. It may be an image-only scan.",
            },
            { status: 400 },
          );
        }

        finalNotes = extractAndSampleChunks(extractedText);
      } catch (pdfError: unknown) {
        const errMessage =
          pdfError instanceof Error ? pdfError.message : "Unknown error";
        return NextResponse.json(
          { error: "Failed to parse the PDF document. " + errMessage },
          { status: 500 },
        );
      }
    }

    if (!finalNotes || finalNotes.trim().length < 40) {
      return NextResponse.json(
        {
          error:
            "Not enough content to generate a quiz. Provide valid notes or a text-based PDF.",
        },
        { status: 400 },
      );
    }

    // Calculate max questions based on content length
    const maxQuestionsAllowed = calculateMaxQuestions(finalNotes.length);

    if (
      !Number.isFinite(requestedCount) ||
      requestedCount < 5 ||
      requestedCount > maxQuestionsAllowed
    ) {
      return NextResponse.json(
        {
          error: `Invalid question count. Based on your content, you can generate a maximum of ${maxQuestionsAllowed} questions.`,
          maxQuestions: maxQuestionsAllowed,
        },
        { status: 400 },
      );
    }

    const questionCount = Number.isFinite(requestedCount)
      ? Math.min(maxQuestionsAllowed, Math.max(5, Math.floor(requestedCount)))
      : 10;

    const generatedQuestions = ensureDifficulty(
      await generateQuizFromNotes(
        finalNotes,
        parsedQuizType.data,
        questionCount,
      ),
    );

    if (!generatedQuestions || generatedQuestions.length === 0) {
      return NextResponse.json(
        { error: "AI failed to generate quiz questions from the content." },
        { status: 500 },
      );
    }

    const quizSetId = nanoid();

    await createQuizSet({
      id: quizSetId,
      userId: session.user.id,
      subject,
      quizType: parsedQuizType.data,
    });

    await createQuizQuestions(
      generatedQuestions.map((question) => ({
        id: nanoid(),
        quizSetId,
        prompt: question.prompt,
        optionsJson: question.options ? JSON.stringify(question.options) : null,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
      })),
    );

    return NextResponse.json({
      success: true,
      quizSetId,
      questionCount: generatedQuestions.length,
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
