export type SpotifyTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  duration: number;
  uri: string;
  previewUrl: string | null;
};
