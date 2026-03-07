import { differenceInDays, parseISO, addDays, startOfDay, isBefore } from "date-fns";

export interface SM2Result {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: string;
}


export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number,
  examDateStr: string
): SM2Result {
  let nextRepetitions = repetitions;
  let nextInterval = interval;
  let nextEaseFactor = easeFactor;

  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      // After 2+ repetitions, grow the interval by the ease factor (e.g. interval 6 * EF 2.5 = 15 days).
      // Higher EF = faster spacing growth for well-known cards.
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions += 1;
  } else {
    // Failed recall: restart the repetition chain from scratch with a 1-day interval.
    nextRepetitions = 0;
    nextInterval = 1;
  }

  // SM-2 ease factor update: Wozniak's polynomial from the original 1987 paper.
  // The nested (5 - quality) terms penalise wrong answers exponentially.
  // EF is floored at 1.3 to prevent perpetually tiny intervals on difficult cards.
  nextEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  const today = startOfDay(new Date());
  const examDate = startOfDay(parseISO(examDateStr));

  // Edge case: if the exam is today or already passed, there's no point scheduling
  // a future review — return today's date so the card shows up immediately.
  if (isBefore(examDate, today) || examDate.getTime() === today.getTime()) {
      return {
          repetitions: nextRepetitions,
          easeFactor: nextEaseFactor,
          interval: 1,
          nextReviewAt: today.toISOString().split('T')[0] as string,
      };
  }

  const daysUntilExam = differenceInDays(examDate, today);

  // Cap the interval so the next review always falls before the exam.
  // Using half the remaining days ensures at least one more review session is possible.
  if (nextInterval >= daysUntilExam) {
     nextInterval = Math.max(1, Math.floor(daysUntilExam / 2));
  }

  const nextReviewDate = addDays(today, nextInterval);

  return {
    repetitions: nextRepetitions,
    easeFactor: nextEaseFactor,
    interval: nextInterval,
    nextReviewAt: nextReviewDate.toISOString().split('T')[0] as string,
  };
}
