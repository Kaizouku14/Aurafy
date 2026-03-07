import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/better-auth";
import { nanoid } from "nanoid";
import { generateCardsFromNotes } from "@/lib/ai/flashcard-ai";
import { createDeckRecord, createCardsBatch } from "@/lib/api/flashcard/queries";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;

function extractAndSampleChunks(fullText: string, maxChars = 8000): string {
  const paragraphs = fullText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 50);

  if (paragraphs.length === 0) {
     return fullText.slice(0, maxChars);
  }

  let sampledText = "";
  let currentLength = 0;

  for (const p of paragraphs) {
    if (currentLength + p.length > maxChars) {
      break;
    }
    sampledText += p + "\n\n";
    currentLength += p.length + 2;
  }

  return sampledText.trim();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subject = formData.get("subject") as string | null;
    const examDate = formData.get("examDate") as string | null;
    const fallbackNotes = formData.get("notes") as string | null;

    if (!subject || !examDate) {
      return NextResponse.json({ error: "Missing required fields (subject, examDate)." }, { status: 400 });
    }

    let finalNotes = fallbackNotes ?? "";

    if (file) {
      if (file.type !== "application/pdf") {
         return NextResponse.json({ error: "Uploaded file must be a PDF." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const pdfData = await pdfParse(buffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length < 50) {
           return NextResponse.json({ error: "Could not extract sufficient text from this PDF. It may be an image-only scan." }, { status: 400 });
        }

        finalNotes = extractAndSampleChunks(extractedText);
      } catch (pdfError: unknown) {
        console.error("PDF Parsing Error:", pdfError);
        const errMessage = pdfError instanceof Error ? pdfError.message : "Unknown error";
        return NextResponse.json({ error: "Failed to parse the PDF document. " + errMessage }, { status: 500 });
      }
    }

    if (!finalNotes || finalNotes.trim().length < 10) {
       return NextResponse.json({ error: "Not enough content to generate flashcards. Please provide valid notes or a text-based PDF." }, { status: 400 });
    }

    const generatedCards = await generateCardsFromNotes(finalNotes);

    if (!generatedCards || generatedCards.length === 0) {
      return NextResponse.json({ error: "AI failed to generate any cards from the provided content." }, { status: 500 });
    }

    const deckId = nanoid();
    await createDeckRecord(deckId, session.user.id, subject, examDate);

    const cardsToInsert = generatedCards.map((card: { front: string; back: string }) => ({
      id: nanoid(),
      deckId,
      front: card.front,
      back: card.back,
    }));

    await createCardsBatch(cardsToInsert);

    return NextResponse.json({
        success: true,
        deckId,
        cardCount: cardsToInsert.length
    });

  } catch (error: unknown) {
    console.error("Upload Route Error:", error);
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
