import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { generateCardsFromNotes } from "@/lib/ai/flashcard-ai";
import { createDeckRecord, createCardsBatch } from "@/lib/api/flashcard/queries";
import pdf from "pdf-parse";

// Function to safely chunk text to avoid LLM context limits
// We aim for roughly 4000-8000 characters to keep Groq generations fast and within limits.
function extractAndSampleChunks(fullText: string, maxChars = 8000): string {
  // Split by double newlines to roughly get paragraphs
  const paragraphs = fullText.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 50);
  
  if (paragraphs.length === 0) {
     return fullText.slice(0, maxChars);
  }

  let sampledText = "";
  let currentLength = 0;

  // Take paragraphs from the beginning, middle, and end to get a good spread,
  // or just take sequentially until we hit the char limit.
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
    // 1. Authenticate Request
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subject = formData.get("subject") as string | null;
    const examDate = formData.get("examDate") as string | null;
    const fallbackNotes = formData.get("notes") as string | null;

    if (!subject || !examDate) {
      return NextResponse.json({ error: "Missing required fields (subject, examDate)." }, { status: 400 });
    }

    let finalNotes = fallbackNotes || "";

    // 3. Process PDF if present
    if (file) {
      if (file.type !== "application/pdf") {
         return NextResponse.json({ error: "Uploaded file must be a PDF." }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const pdfData = await pdf(buffer);
        const extractedText = pdfData.text;
        
        if (!extractedText || extractedText.trim().length < 50) {
           return NextResponse.json({ error: "Could not extract sufficient text from this PDF. It may be an image-only scan." }, { status: 400 });
        }

        // Chunk and sample the PDF text to protect the LLM context window
        finalNotes = extractAndSampleChunks(extractedText);
      } catch (pdfError: any) {
        console.error("PDF Parsing Error:", pdfError);
        return NextResponse.json({ error: "Failed to parse the PDF document. " + pdfError.message }, { status: 500 });
      }
    }

    if (!finalNotes || finalNotes.trim().length < 10) {
       return NextResponse.json({ error: "Not enough content to generate flashcards. Please provide valid notes or a text-based PDF." }, { status: 400 });
    }

    // 4. Generate Cards via AI
    const generatedCards = await generateCardsFromNotes(finalNotes);
    
    if (!generatedCards || generatedCards.length === 0) {
      return NextResponse.json({ error: "AI failed to generate any cards from the provided content." }, { status: 500 });
    }

    // 5. Database Transactions
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

  } catch (error: any) {
    console.error("Upload Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
