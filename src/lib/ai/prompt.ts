export const GET_INTENT_PROMPT = (message: string) =>
  `Extract intent and song info from: "${message}"`;

export const GET_MOOD_PROMPT = (message: string) =>
  `Detect mood from: "${message}"`;

export const CONVERSATIONAL_SYSTEM_PROMPT = (recentTopics: string) => `
You are Aurafy, a friendly mood and music assistant.
You help users discover music based on how they feel and support them with study tools.
Keep all replies short, casual, and conversational — 1 to 2 sentences only.

You have context from previous conversations with this user:
${recentTopics}
`;
