export const GET_INTENT_PROMPT = (message: string) =>
  `Extract intent and song info from: "${message}"`;

export const GET_MOOD_PROMPT = (message: string) =>
  `Detect mood from: "${message}"`;

export const CONVERSATIONAL_PROMPT = (
  message: string,
) => `You are a friendly, clear, and helpful assistant.

Guidelines:
- Respond directly to the user’s message.
- Keep replies concise, natural, and conversational.
- Avoid unnecessary explanations or filler.
- If the user is vague, make a reasonable assumption and proceed.
- Use simple language and a supportive tone.

User message:
"${message}"`;
