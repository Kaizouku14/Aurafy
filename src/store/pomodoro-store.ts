import { create } from "zustand";
import { getDefaultDurations, type Mode } from "@/constants/pomodoro-modes";

interface PomodoroState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  customDurations: Record<Mode, number>;
  intervalId: ReturnType<typeof setInterval> | null;
  onTimerStart: (() => void) | null;
  onTimerEnd: (() => void) | null;
  setMode: (mode: Mode) => void;
  setCustomDurations: (durations: Record<Mode, number>) => void;
  setCallbacks: (
    onStart: () => void,
    onEnd: () => void,
  ) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

const defaults = getDefaultDurations();

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: "pomo",
  timeLeft: defaults.pomo,
  isRunning: false,
  customDurations: defaults,
  intervalId: null,
  onTimerStart: null,
  onTimerEnd: null,

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

  setCallbacks: (onStart, onEnd) => {
    set({ onTimerStart: onStart, onTimerEnd: onEnd });
  },

  tick: () => {
    const { timeLeft, onTimerEnd } = get();
    if (timeLeft <= 1) {
      const { intervalId } = get();
      if (intervalId) clearInterval(intervalId);
      set({ timeLeft: 0, isRunning: false, intervalId: null });
      onTimerEnd?.();
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  start: () => {
    const { intervalId, tick, onTimerStart } = get();
    if (intervalId) clearInterval(intervalId);
    const id = setInterval(tick, 1000);
    set({ isRunning: true, intervalId: id });
    onTimerStart?.();
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
