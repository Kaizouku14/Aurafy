export const INTENT = [
  "play_song",
  "play_mood",
  "play_artist",
  "others",
] as const;
export type Intent = (typeof INTENT)[number];

export const INTENT_LABELS: Record<string, Intent> = {
  PLAY_SONG: "play_song",
  PLAY_MOOD: "play_mood",
  PLAY_ARTIST: "play_artist",
  OTHERS: "others",
} as const;

export const MOOD = [
  "happy",
  "calm",
  "sad",
  "energetic",
  "stressed",
  "focused",
] as const;

export const MOOD_MAP = {
  happy: {
    genres: ["pop", "dance"],
  },
  calm: {
    genres: ["lo-fi", "ambient"],
  },
  sad: {
    genres: ["acoustic", "indie"],
  },
  energetic: {
    genres: ["electronic", "hip-hop"],
  },
  stressed: {
    genres: ["classical", "jazz"],
  },
  focused: {
    genres: ["study", "classical"],
  },
} as const;

export type Mood = (typeof MOOD)[number];
