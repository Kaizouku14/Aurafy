import { getSession } from "@/server/better-auth";
import YTMusic from "ytmusic-api";

type YtMusicSearchBody = {
  userId?: string;
  query?: string;
  limit?: number;
};

type YtMusicResult = {
  videoId: string;
  name: string;
  artist: {
    name: string;
  };
  album: {
    name: string;
  } | null;
  duration: number | null;
  thumbnails: Array<{ url: string }>;
};

let ytmusicClient: YTMusic | null = null;
let ytmusicClientPromise: Promise<YTMusic> | null = null;

const getYtMusicClient = async (): Promise<YTMusic> => {
  if (ytmusicClient) return ytmusicClient;
  if (ytmusicClientPromise) return ytmusicClientPromise;

  ytmusicClientPromise = (async () => {
    const client = new YTMusic();
    await client.initialize();
    ytmusicClient = client;
    return client;
  })();

  return ytmusicClientPromise;
};

const clampLimit = (value?: number): number => {
  if (!value) return 10;
  if (value < 1) return 1;
  if (value > 25) return 25;
  return value;
};

const mapResult = (result: YtMusicResult) => ({
  id: result.videoId,
  videoId: result.videoId,
  title: result.name,
  artist: result.artist.name,
  artists: [result.artist.name],
  album: result.album?.name,
  cover: result.thumbnails[0]?.url ?? null,
  durationMs: (result.duration ?? 0) * 1000,
  uri: result.videoId
    ? `https://music.youtube.com/watch?v=${result.videoId}`
    : "",
  previewUrl: result.videoId ? `/api/ytmusic/stream/${result.videoId}` : null,
});

export const POST = async (req: Request) => {
  const session = await getSession();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await req.json()) as YtMusicSearchBody;
  const query = body.query?.trim();
  if (!query) {
    return Response.json({ tracks: [] });
  }

  const limit = clampLimit(body.limit);

  try {
    const client = await getYtMusicClient();
    const songs = (await client.searchSongs(query)) as YtMusicResult[];
    const tracks = songs.slice(0, limit).map(mapResult);

    return Response.json({ tracks });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown search error",
      },
      { status: 500 },
    );
  }
};
