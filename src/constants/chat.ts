export const INTENT = ["play_song", "play_mood", "other"] as const;
export type Intent = (typeof INTENT)[number];

export const INTENT_LABELS: Record<string, Intent> = {
  PLAY_SONG: "play_song",
  PLAY_MOOD: "play_mood",
  OTHER: "other",
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
    energy: 0.8,
    valence: 0.9,
    minTempo: 120,
    maxTempo: 140,
    genres: ["pop", "dance"],
  },
  calm: {
    energy: 0.3,
    valence: 0.6,
    minTempo: 60,
    maxTempo: 80,
    genres: ["lo-fi", "ambient"],
  },
  sad: {
    energy: 0.2,
    valence: 0.2,
    minTempo: 60,
    maxTempo: 70,
    genres: ["acoustic", "indie"],
  },
  energetic: {
    energy: 0.9,
    valence: 0.7,
    minTempo: 140,
    maxTempo: 160,
    genres: ["hip-hop", "edm"],
  },
  stressed: {
    energy: 0.6,
    valence: 0.3,
    minTempo: 80,
    maxTempo: 100,
    genres: ["classical", "jazz"],
  },
  focused: {
    energy: 0.4,
    valence: 0.5,
    minTempo: 80,
    maxTempo: 100,
    genres: ["instrumental", "lo-fi"],
  },
} as const;

export type Mood = (typeof MOOD)[number];
