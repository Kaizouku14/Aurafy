import { INTENT } from "@/constants/chat";

export const GET_INTENT_PROMPT = (message: string) => `
You are an intent classifier for a music chatbot called Aurafy.

Classify the user's message into exactly one intent and extract relevant fields.

### Intents
- **play_mood**: The user is describing how they feel, their energy level, or asking for music that matches a mood.
  Examples: "I'm feeling happy", "play something chill", "I need energy", "feeling down today"
- **play_song**: The user wants a specific song played. Extract the song title and optionally the artist.
  Examples: "play Blinding Lights", "play Bohemian Rhapsody by Queen", "can you play that song", "play the one you mentioned"
- **play_artist**: The user wants music by a specific artist. Extract the artist name.
  Examples: "play Taylor Swift", "I want to hear some Drake", "put on The Weeknd"
- **others**: General conversation, questions, greetings, or anything that doesn't fit the above.
  Examples: "hello", "what can you do?", "thanks", "how does this work?"

### Rules
1. If the user says "play that", "play it", or references a previously mentioned song, classify as play_song and set songTitle to the referenced song if identifiable from context, otherwise set songTitle to null.
2. Only set songTitle when the user explicitly mentions or references a specific song.
3. Only set artist when the user explicitly mentions an artist name.
4. When in doubt between play_mood and others, prefer play_mood if the message contains any emotional or energy language.

### Output format
Return a JSON object with:
- intent: one of ${JSON.stringify(INTENT)}
- songTitle: string or null
- artist: string or null

User message: "${message}"
`;

export const GET_MOOD_PROMPT = (message: string) =>
  `Detect the primary mood from this message. Choose the mood that best matches the emotional tone.
Available moods: happy, calm, sad, energetic, stressed, focused.
Also estimate energy (0-1), valence (0-1), and your confidence (0-1) in the classification.

Message: "${message}"`;

export const CONVERSATIONAL_SYSTEM_PROMPT = (recentTopics: string) => `
You are Aurafy, a friendly mood and music assistant.
You help users discover music based on how they feel and support them with study tools.
Keep all replies short, casual, and conversational — 1 to 2 sentences only.
Do not use emojis excessively. Sound natural and human.

When you suggest a song, always mention it clearly by name so the user can ask to play it.

You have context from previous conversations with this user:
${recentTopics}
`;

export const GENERATE_CARDS_PROMPT = (notes: string) => `You are an expert educator. Extract the core concepts, terms, and facts from the following notes and generate a deck of flashcards. Keep the 'front' succinct and clear. Keep the 'back' concise but fully accurate.

Notes:
${notes}`;

export const EVALUATE_ANSWER_PROMPT = (front: string, back: string, userAnswer: string) => `You are an expert tutor evaluating a student's answer to a flashcard. 
Your goal is to test if the student grasps the underlying CONCEPTS, not just if they memorized the exact wording.
If their answer means the same thing logically, score them highly. If they missed a critical nuance, score them lower and explain why.

Card Question (Front): ${front}
True Answer (Back): ${back}

Student's Answer: ${userAnswer}`;

export const GENERATE_STUDY_PLAN_PROMPT = (
  subjects: string,
  startDate: string,
  endDate: string,
  hoursPerDay: number
) => `You are an expert academic planner. Generate a detailed, day-by-day study schedule.

Subjects and their exam dates:
${subjects}

Schedule period: ${startDate} to ${endDate}
Available study hours per day: ${hoursPerDay}

Rules:
- Distribute subjects evenly, but prioritize subjects whose exams are sooner.
- Each day should have concrete study blocks with a subject, activity type (e.g., "Review flashcards", "Read chapter", "Practice problems", "Pomodoro deep work"), and a duration in minutes.
- Include short breaks between blocks.
- As an exam approaches, increase that subject's frequency.
- Keep the schedule realistic and achievable.`;
