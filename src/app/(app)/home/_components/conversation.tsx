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
import type { ChatMessage } from "@/types/schema";

const Conversation = () => {
  const [message, setMessage] = React.useState<string>("");
  const [history, setHistory] = React.useState<ChatMessage[]>([]);
  const { mutateAsync: sendMessage, isPending } =
    api.chat.sendMessage.useMutation();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage("");

    try {
      const { reply } = await sendMessage({
        message: currentMessage,
        previousMessages: history,
      });

      const assistantText =
        typeof reply === "string"
          ? reply
          : (reply?.reply ?? JSON.stringify(reply));

      setHistory((prev) => [
        ...prev,
        { role: "user", content: currentMessage },
        { role: "assistant", content: assistantText },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(String(error));
      }
    }
  };

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
        <Button
          onClick={handleSendMessage}
          disabled={isPending || !message.trim()}
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Conversation;
