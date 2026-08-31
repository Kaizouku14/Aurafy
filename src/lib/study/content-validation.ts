import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { MODELS } from "@/lib/ai/models";

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s]+/gi;
const FOOTER_PATTERN = /^\s*(?:page\s+\d+|\d+\s*\/\s*\d+|\d+\s*of\s*\d+|\d+)\s*$/gim;
const NAV_PATTERN =
  /^\s*(?:home|menu|search|skip|next|back|view all|read more|sign in|sign up|log in|login|register|subscribe|contact(?: us)?|about(?: us)?|privacy(?: policy)?|\bterms\b|\bfaq\b|\#+[^\n]*)$/gim;

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "that",
  "this",
  "are",
  "was",
  "with",
  "had",
  "from",
  "have",
  "has",
  "not",
  "but",
  "they",
  "will",
  "just",
  "like",
  "more",
  "than",
  "then",
  "now",
  "can",
  "all",
  "also",
  "your",
  "how",
  "what",
  "why",
  "when",
  "who",
  "which",
  "there",
  "these",
  "those",
  "them",
  "their",
  "them",
  "about",
  "would",
  "could",
  "should",
  "because",
  "after",
  "before",
  "into",
  "without",
]);

export const UNREADABLE_MESSAGE =
  "We couldn't extract readable study content from this material. It may be an image-only scan, a corrupted file, or contain mostly formatting instead of text.";

export const TOO_SHORT_MESSAGE =
  "There isn't enough content here to generate study material. Please upload longer or more detailed notes.";

export const NOT_EDUCATIONAL_MESSAGE =
  "We couldn't detect enough relevant, educational content here to base study material on. Please upload your class notes, a textbook section, an article, or other learning material.";

export const LINK_ONLY_MESSAGE =
  "This content looks like mostly links, menus, or navigation instead of study material. Please upload the actual notes or article text.";

export type StudyContentAssessment =
  | { ok: true; normalized: string }
  | { ok: false; message: string };

const STUDY_CONTENT_CHECK_PROMPT = `
You are validating whether pasted text is usable as source material for generating study content (flashcards or quiz questions).

Return isEducational: true only if the text contains real, learnable knowledge such as:
- factual explanations, definitions, procedures, causes, examples, data, laws, theories or formulas
- textbook excerpts, articles, lecture notes, or structured study guides

Return isEducational: false if the text is instead: completely random or unrelated sentences, a fictional story or creative writing, a recipe, a chat conversation, spam, lyrics, navigation/menu/footer boilerplate, or otherwise has no learnable educational content.

reason: give a single short sentence explaining why (use null when isEducational is true).

Text to evaluate:
"""content"""
`.trim();

function cleanStudyText(raw: string): string {
  return (raw ?? "")
    .replace(/\uFFFD/g, "")
    .replace(URL_PATTERN, " ")
    .replace(FOOTER_PATTERN, " ")
    .replace(NAV_PATTERN, " ")
    .trim();
}

export async function assessStudyContent(
  raw: string,
): Promise<StudyContentAssessment> {
  const text = (raw ?? "").trim();

  if (text.length === 0) {
    return { ok: false, message: UNREADABLE_MESSAGE };
  }

  const cleaned = cleanStudyText(text);
  const words = cleaned.match(/[A-Za-z]{3,}/g) ?? [];

  if (words.length < 30) {
    return { ok: false, message: TOO_SHORT_MESSAGE };
  }

  const contentWords = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  const contentRatio = contentWords.length / words.length;
  const distinctRatio =
    new Set(words.map((w) => w.toLowerCase())).size / words.length;
  const urlCount = (text.match(URL_PATTERN) ?? []).length;

  if (contentRatio < 0.12) {
    return { ok: false, message: NOT_EDUCATIONAL_MESSAGE };
  }

  if (distinctRatio > 0.93) {
    return { ok: false, message: NOT_EDUCATIONAL_MESSAGE };
  }

  if (urlCount > 5 && words.length < 60) {
    return { ok: false, message: LINK_ONLY_MESSAGE };
  }

  const { object } = await generateObject({
    model: groq(MODELS.flashcards),
    schema: z.object({
      isEducational: z.boolean(),
      reason: z
        .string()
        .nullable()
        .describe("Single short sentence, or null when isEducational is true"),
    }),
    prompt: STUDY_CONTENT_CHECK_PROMPT.replace('"""content"""', cleaned.slice(0, 8000)),
  });

  if (!object.isEducational) {
    const reason = object.reason?.trim() ? ` ${object.reason.trim()}` : "";
    return { ok: false, message: `${NOT_EDUCATIONAL_MESSAGE}${reason}` };
  }

  return { ok: true, normalized: cleaned.slice(0, 10000) };
}

const BLANK_ALNUM = /[A-Za-z0-9]/;
const URL_ONLY = /^\s*(?:https?:\/\/|www\.)\S+\s*$/i;

export type ManualCardValidation =
  | { ok: true; front: string; back: string }
  | { ok: false; message: string };

export function validateManualCard(
  front: string,
  back: string,
): ManualCardValidation {
  const f = front.trim().replace(/\s+/g, " ");
  const b = back.trim().replace(/\s+/g, " ");

  if (!f) {
    return { ok: false, message: "The card question is required." };
  }

  if (!b) {
    return { ok: false, message: "The card answer is required." };
  }

  if (f.length < 3 || !BLANK_ALNUM.test(f)) {
    return {
      ok: false,
      message:
        "The card question doesn't contain any real content. Please write a proper question.",
    };
  }

  if (b.length < 2 || !BLANK_ALNUM.test(b)) {
    return {
      ok: false,
      message:
        "The card answer doesn't contain any real content. Please write a proper answer.",
    };
  }

  if (URL_ONLY.test(f)) {
    return {
      ok: false,
      message:
        "A URL can't be a card question on its own. Please write an actual question.",
    };
  }

  if (f.length > 2000) {
    return {
      ok: false,
      message: "The card question is too long (max 2,000 characters).",
    };
  }

  if (b.length > 5000) {
    return {
      ok: false,
      message: "The card answer is too long (max 5,000 characters).",
    };
  }

  return { ok: true, front: f, back: b };
}

export function dedupeByNormalized<T>(
  items: T[],
  key: (item: T) => string,
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const normalized = key(item).trim().toLowerCase().replace(/\s+/g, " ");
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(item);
  }

  return result;
}