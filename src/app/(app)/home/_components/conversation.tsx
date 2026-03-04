"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import type { ChatMessage, ChatResponse } from "@/types/schema";
import { sileo } from "sileo";

const Conversation = () => {
  const [message, setMessage] = React.useState<string>("");
  const [history, setHistory] = React.useState<ChatMessage[]>([]);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const { mutateAsync: sendMessage, isPending } =
    api.chat.sendMessage.useMutation();

  const handleSpotifyAction = (response: ChatResponse) => {
    if (response.type === "play_mood") {
      // TODO: call Spotify API with mood data
      console.log("Play mood:", response.mood);
    }

    if (response.type === "play_song") {
      // TODO: call Spotify API to search/play song
      console.log("Play song:", response.songTitle, "by", response.artist);
    }
  };

  const handleAbort = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage("");

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await Promise.race([
        sendMessage({
          message: currentMessage,
          previousMessages: history,
        }),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
      ]);

      setHistory((prev) => [
        ...prev,
        { role: "user", content: currentMessage },
        { role: "assistant", content: response.text },
      ]);

      handleSpotifyAction(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        sileo.error({
          title: "AbortError",
          description: error.message,
        });

        return;
      }

      if (error instanceof Error) {
        sileo.error({
          title: error.name,
          description: error.message,
        });
      } else {
        sileo.error({
          title: "An error occurred",
          description: String(error),
        });
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <Card className="w-1/2">
      <CardHeader>Chat with Groq</CardHeader>
      <CardContent className="border-border h-80 overflow-y-auto border-y">
        {history.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block rounded-lg px-3 py-1.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isPending) handleSendMessage();
          }}
          placeholder="Type a message..."
          disabled={isPending}
        />
        {isPending ? (
          <Button variant="neutral" onClick={handleAbort}>
            Stop
          </Button>
        ) : (
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            Send
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Conversation;
