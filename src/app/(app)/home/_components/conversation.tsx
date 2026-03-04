"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatBubble from "./chat-bubble";
import ChatInput from "./chat-input";
import ChatEmpty from "./chat-empty";

const Conversation = () => {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    experimental_throttle: 50,
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = React.useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage],
  );

  return (
    <Card className="flex w-full max-w-md flex-col">
      <CardHeader className="border-border border-b">
        <CardTitle>Aurafy</CardTitle>
      </CardHeader>

      <CardContent className="px-1">
        <ScrollArea ref={scrollRef} className="h-70">
          <div className="flex flex-1 flex-col gap-3 px-3">
            {messages.length === 0 ? (
              <ChatEmpty onSuggestion={handleSend} />
            ) : (
              <>
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}

                {status === "submitted" && (
                  <div className="flex justify-start">
                    <div className="bg-secondary-background text-foreground/60 rounded-base border-border flex items-center gap-2 border-2 px-3 py-2 text-sm">
                      <Loader2 className="size-3 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-secondary-background text-foreground/60 rounded-base border-border border-2 px-3 py-2 text-center text-sm">
                    Something went wrong. Try sending your message again.
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-border border-t pt-4">
        <ChatInput status={status} onSend={handleSend} onStop={stop} />
      </CardFooter>
    </Card>
  );
};

export default Conversation;
