import { differenceInDays, parseISO, addDays, startOfDay, isBefore } from "date-fns";

export interface SM2Result {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: string; // ISO format: YYYY-MM-DD
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
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions += 1;
  } else {
    nextRepetitions = 0;
    nextInterval = 1;
  }

  nextEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  const today = startOfDay(new Date());
  const examDate = startOfDay(parseISO(examDateStr));

  if (isBefore(examDate, today) || examDate.getTime() === today.getTime()) {
      return {
          repetitions: nextRepetitions,
          easeFactor: nextEaseFactor,
          interval: 1,
          nextReviewAt: today.toISOString().split('T')[0] as string,
      };
  }

  const daysUntilExam = differenceInDays(examDate, today);

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
