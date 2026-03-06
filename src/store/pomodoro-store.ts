import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDefaultDurations, type Mode } from "@/constants/pomodoro-modes";

export interface PomodoroSettings {
  pomo: number;
  short: number;
  long: number;
  sessionsBeforeLongBreak: number;
}

interface PomodoroState {
  mode: Mode;
  timeLeft: number;
  isRunning: boolean;
  settings: PomodoroSettings;
  currentSession: number;
  intervalId: ReturnType<typeof setInterval> | null;
  onTimerStart: (() => void) | null;
  onTimerEnd: (() => void) | null;

  setMode: (mode: Mode) => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  setCallbacks: (onStart: () => void, onEnd: () => void) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

const defaultSettings: PomodoroSettings = {
  ...getDefaultDurations(),
  sessionsBeforeLongBreak: 4,
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      mode: "pomo",
      timeLeft: defaultSettings.pomo,
      isRunning: false,
      settings: defaultSettings,
      currentSession: 1,
      intervalId: null,
      onTimerStart: null,
      onTimerEnd: null,

      setMode: (mode) => {
        const { intervalId, settings } = get();
        if (intervalId) clearInterval(intervalId);
        set({
          mode,
          timeLeft: settings[mode],
          isRunning: false,
          intervalId: null,
        });
      },

      updateSettings: (newSettings) => {
        const { mode, settings: currentSettings, isRunning } = get();
        const settings = { ...currentSettings, ...newSettings };

        const updates: Partial<PomodoroState> = { settings };

        // If we're not running, or if the duration for the current mode changed, update timeLeft
        if (!isRunning) {
          updates.timeLeft = settings[mode];
        }

        set(updates);
      },

      setCallbacks: (onStart, onEnd) => {
        set({ onTimerStart: onStart, onTimerEnd: onEnd });
      },

      tick: () => {
        const { timeLeft, onTimerEnd, mode, currentSession, settings } = get();

        if (timeLeft <= 1) {
          const { intervalId } = get();
          if (intervalId) clearInterval(intervalId);

          let nextMode: Mode = mode;
          let nextSession = currentSession;

          if (mode === "pomo") {
            if (currentSession >= settings.sessionsBeforeLongBreak) {
              nextMode = "long";
              nextSession = 1; // Reset cycle
            } else {
              nextMode = "short";
              nextSession = currentSession + 1;
            }
          } else {
            nextMode = "pomo";
          }

          set({
            timeLeft: settings[nextMode],
            mode: nextMode,
            currentSession: nextSession,
            isRunning: false,
            intervalId: null
          });
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
        const { intervalId, mode, settings } = get();
        if (intervalId) clearInterval(intervalId);
        set({
          timeLeft: settings[mode],
          isRunning: false,
          intervalId: null,
        });
      },
    }),
    {
      name: "aurafy-pomodoro-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
