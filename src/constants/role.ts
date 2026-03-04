export const ROLE = ["user", "assistant"] as const;

export type Role = (typeof ROLE)[number];

export const ROLES_LABELS = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;
