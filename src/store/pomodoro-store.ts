import { create } from "zustand";
import { DEFAULT_DURATIONS, type Mode } from "@/constants/pomodoro-modes";

interface PomodoroState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  customDurations: Record<Mode, number>;
  intervalId: ReturnType<typeof setInterval> | null;
  setMode: (mode: Mode) => void;
  setCustomDurations: (durations: Record<Mode, number>) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: "pomo",
  timeLeft: DEFAULT_DURATIONS.pomo,
  isRunning: false,
  customDurations: DEFAULT_DURATIONS,
  intervalId: null,

  setMode: (mode) => {
    const { intervalId, customDurations } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      mode,
      timeLeft: customDurations[mode],
      isRunning: false,
      intervalId: null,
    });
  },

  setCustomDurations: (durations) => {
    const { mode } = get();
    set({
      customDurations: durations,
      timeLeft: durations[mode],
      isRunning: false,
    });
  },

  tick: () => {
    const { timeLeft } = get();
    if (timeLeft <= 1) {
      const { intervalId } = get();
      if (intervalId) clearInterval(intervalId);
      set({ timeLeft: 0, isRunning: false, intervalId: null });
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  start: () => {
    const { intervalId, tick } = get();
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(tick, 1000);
    set({ isRunning: true, intervalId: id });
  },

  pause: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ isRunning: false, intervalId: null });
  },

  reset: () => {
    const { intervalId, mode, customDurations } = get();
    if (intervalId) clearInterval(intervalId);
    set({
      timeLeft: customDurations[mode],
      isRunning: false,
      intervalId: null,
    });
  },
}));
