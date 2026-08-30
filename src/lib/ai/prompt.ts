import { INTENT } from "@/constants/chat";

export const GET_INTENT_PROMPT = (message: string, previousAssistantMessage = "") => `
Classify the user's message into exactly one intent for Aurafy, a music chatbot. Extract fields per the rules below.

Previous assistant message: "${previousAssistantMessage}"
User message: "${message}"

### Intents
- play_mood: user describes a feeling/energy level or asks for music matching a mood ("I'm feeling happy", "play something chill").
- play_song: user wants a specific song. Extract songTitle (and artist if stated) ("play Blinding Lights", "play Bohemian Rhapsody by Queen").
- play_artist: user wants music by an artist. Extract artist ("play Taylor Swift").
- others: anything else (greetings, questions, thanks, small talk).

### Rules
1. "play that / play it / that song" referencing a prior turn → play_song; set songTitle from previousAssistantMessage if identifiable, else null.
2. Set songTitle/artist ONLY when explicitly named or resolvable per rule 1 — never guess.
3. Ambiguous between play_mood and others → play_mood if any emotional/energy language is present.

### Output
Return ONLY this JSON object, no other text:
{"intent": one of ${JSON.stringify(INTENT)}, "songTitle": string|null, "artist": string|null}
`;

export const GET_MOOD_PROMPT = (message: string) => `Classify the primary mood of this message, choosing the single best match.

Available moods: happy, calm, sad, energetic, stressed, focused.

Message: "${message}"

Return ONLY this JSON object, no other text:
{"mood": one of the moods above, "energy": number 0-1, "valence": number 0-1, "confidence": number 0-1}`;

export const GET_MOOD_QUERIES_PROMPT = (
  message: string,
  mood: string,
  context: string,
) => `Craft music search queries that capture how the user is feeling right now, so a search engine can surface matching tracks.

User's message: "${message}"
Detected mood: ${mood}
${context}

Write exactly 4 search queries using rich, niche, specific musical language — genre + descriptor + vibe — e.g. "lofi hip hop with rain sounds", "dreamy chill electronica", "soft indie folk warm blanket".
- Never use a single generic word like "pop" or "jazz" — always pair it with a feeling/atmosphere descriptor.
- Each query must feel different from the others (mix sub-genres and vibes).
- Keep every query lowercase, 2-5 words, and free of quotes, punctuation, or search-operator characters.

Return ONLY this JSON object, no other text:
{"queries": ["query 1", "query 2", "query 3", "query 4"]}`;

export const CONVERSATIONAL_SYSTEM_PROMPT = (
  recentTopics: string,
  options?: { allowPlaybackOffers?: boolean },
) => {
  const allowPlaybackOffers = options?.allowPlaybackOffers ?? true;

  return `You are Aurafy, a friendly mood and music assistant. You help users discover music based on how they feel and support them with study tools.

Reply in 1-2 short, casual, natural sentences. Use emojis sparingly, if at all.

${
  allowPlaybackOffers
    ? "When suggesting a song, name it explicitly so the user can ask to play it."
    : "Do not offer to play songs or ask playback-style questions — stay purely conversational."
}

Prior context with this user:
${recentTopics}`;
};

export const GENERATE_CARDS_PROMPT = (notes: string) => `Extract the core concepts, terms, and facts from the notes below and generate flashcards. Use only information present in the notes — do not add outside facts.

- front: a succinct, clear prompt or term.
- back: a concise, fully accurate answer.
- Maximum 20 cards.

Notes:
${notes}

Return ONLY this JSON object, no other text:
{"cards": [{"front": string, "back": string}]}`;

export const GENERATE_OPEN_ENDED_QUIZ_PROMPT = (notes: string, count: number) => `Generate exactly ${count} open-ended comprehension questions from the notes below, testing understanding, reasoning, and application — not recall. Base every question and answer only on the notes; do not introduce outside facts.

- Each question must be unambiguous and answerable from the notes.
- No yes/no or multiple-choice questions.
- Spread questions across cognitive levels: understanding, analysis, application, evaluation.
- Each question has difficulty "medium" or "hard".
- Each question has a reference answer: accurate, detailed, naturally phrased.

Notes:
${notes}

Return ONLY this JSON object, no other text:
{"questions": [{"prompt": string, "difficulty": "medium"|"hard", "referenceAnswer": string}]}`;

export const OPEN_ENDED_FEEDBACK_SYSTEM_PROMPT = `You are an AI tutor giving feedback on a student's answer to a comprehension question, comparing it against a reference answer.

Feedback must:
- Note what the student understood correctly.
- Identify misconceptions, missing key ideas, or factual errors.
- Give clear, actionable suggestions for improvement.
- Use a warm, instructive tone — never robotic, judgmental, or a bare "Good job."
- Never quote the question or answer verbatim; discuss meaning and improvement.
- Be self-contained (understandable without external context).
- Run 2-3 short paragraphs or bullet points.
- If the answer is off-topic, gently redirect the student without revealing the reference answer outright.

Scoring:
- 5 = ideal match to the reference answer; 4 = minor omission but correct; 3 = acceptable, partial understanding; 1-2 = mostly incorrect; 0 = wrong, irrelevant, or empty.

If the answer is irrelevant, nonsensical, or inappropriate (gibberish, profanity, spam), do not give feedback — set "error" to a short explanation and set "feedback" to an empty string.

Return ONLY this JSON object, no other text:
{"score": number 0-5, "feedback": string, "error": string|null} — "error" is null unless the answer is gibberish, profanity, spam, or completely off-topic.`;

export const EVALUATE_OPEN_ENDED_PROMPT = (
  prompt: string,
  referenceAnswer: string,
  userAnswer: string,
) => `Evaluate the student's answer against the reference answer for this comprehension question.

Question:
${prompt}

Reference Answer:
${referenceAnswer}

Student's Answer:
${userAnswer}`;

export const EVALUATE_ANSWER_PROMPT = (front: string, back: string, userAnswer: string) => `Evaluate whether the student's answer demonstrates the same underlying concept as the true answer — exact wording doesn't matter. Score highly if the meaning matches; score lower and explain if a critical nuance is missing.

Scoring: 5 = perfect conceptual match; 4 = minor omission but correct; 3 = partially correct; 1-2 = mostly incorrect; 0 = completely wrong.

Card Question (Front): ${front}
True Answer (Back): ${back}
Student's Answer: ${userAnswer}

Return ONLY this JSON object, no other text:
{"score": number 0-5, "feedback": string} — feedback is 1-2 sentences: explain why the score was given, what was correct, and any misconceptions against the true answer.`;

export const GENERATE_STUDY_PLAN_PROMPT = (
  subjects: string,
  startDate: string,
  endDate: string,
  hoursPerDay: number
) => `Generate a realistic, day-by-day study schedule.

Subjects and exam dates:
${subjects}

Period: ${startDate} to ${endDate}
Study hours available per day: ${hoursPerDay}

Rules:
- Distribute subjects evenly, prioritizing those with nearer exams.
- Increase a subject's frequency as its exam approaches.
- Each day has ordered blocks; every block has a start time ("HH:MM"), subject, activity type (e.g. "Review flashcards", "Read chapter", "Practice problems", "Pomodoro deep work"), and duration in minutes.
- Include short breaks between blocks.
- Do not exceed the daily hour budget.

Return ONLY this JSON object, no other text:
{"days": [{"date": string, "blocks": [{"time": string, "subject": string, "activity": string, "duration": number}]}]}`;
