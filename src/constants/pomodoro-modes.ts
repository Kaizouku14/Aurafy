export const MODES = {
  pomo: { label: "Pomodoro", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 },
} as const;

export type Mode = keyof typeof MODES;

export const getDefaultDurations = (): Record<Mode, number> =>
  Object.fromEntries(
    Object.entries(MODES).map(([key, { duration }]) => [key, duration]),
  ) as Record<Mode, number>;
