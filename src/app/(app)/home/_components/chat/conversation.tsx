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
  CardDescription,
} from "@/components/ui/card";
import { AudioLines, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatBubble from "./chat-bubble";
import ChatEmpty from "./chat-empty";
import ChatInput from "./chat-input";

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
    <Card className="flex w-full max-w-md flex-col pt-1">
      <CardHeader className="border-border border-b-2 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-main shadow-shadow rounded-base flex size-9 items-center justify-center border-2 border-black">
            <AudioLines className="size-5 text-black" />
          </div>
          <div>
            <CardTitle className="text-foreground text-base">
              Aurafy Chat
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Powered by Groq
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-1">
        <ScrollArea ref={scrollRef} className="h-80">
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
                    <div className="rounded-base border-border bg-background text-muted-foreground flex items-center gap-2 border-2 px-3 py-2 text-sm">
                      <Loader2 className="size-3 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-base border-border bg-background text-muted-foreground border-2 px-3 py-2 text-center text-sm">
                    Something went wrong. Try again.
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-border border-t-2 pt-4">
        <ChatInput status={status} onSend={handleSend} onStop={stop} />
      </CardFooter>
    </Card>
  );
};

export default Conversation;
