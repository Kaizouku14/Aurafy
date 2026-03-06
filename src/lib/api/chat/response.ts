import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
} from "ai";
import type { Track } from "@/types/schema/chat";

export const createTextWithTracksResponse = (
  assistantText: string,
  tracks?: Track[],
) => {
  const textId = generateId();
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });

      if (tracks && tracks.length > 0) {
        writer.write({ type: "data-tracks", data: tracks });
      }

      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: assistantText });
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
};
