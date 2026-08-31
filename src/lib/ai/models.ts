// Separated to make model management easier.
export const MODELS = {
  default: "qwen/qwen3.6-27b",
  chat: "openai/gpt-oss-20b",
  mood: "openai/gpt-oss-20b",
  flashcards: "openai/gpt-oss-20b",
  quiz: "openai/gpt-oss-20b",
  evaluation: "openai/gpt-oss-120b",
} as const;
