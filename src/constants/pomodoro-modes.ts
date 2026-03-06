export const MODES = {
  pomo: { label: "Pomodoro", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 },
} as const;

export const DEFAULT_DURATIONS: Record<Mode, number> = {
  pomo: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export type Mode = keyof typeof MODES;
