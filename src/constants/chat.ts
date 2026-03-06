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
    energy: 0.8,
    valence: 0.9,
    tempo: 120,
  },
  calm: {
    genres: ["lo-fi", "ambient"],
    energy: 0.3,
    valence: 0.6,
    tempo: 75,
  },
  sad: {
    genres: ["acoustic", "indie"],
    energy: 0.3,
    valence: 0.2,
    tempo: 70,
  },
  energetic: {
    genres: ["electronic", "hip-hop"],
    energy: 0.9,
    valence: 0.7,
    tempo: 140,
  },
  stressed: {
    genres: ["classical", "jazz"],
    energy: 0.4,
    valence: 0.5,
    tempo: 85,
  },
  focused: {
    genres: ["study", "classical"],
    energy: 0.5,
    valence: 0.5,
    tempo: 95,
  },
} as const;

export type Mood = (typeof MOOD)[number];
