"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { BotMessageSquare, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatBubble from "./chat-bubble";
import ChatEmpty from "./chat-empty";
import ChatInput from "./chat-input";
import { sharedChat } from "@/lib/chat-instance";
import { StaggerList } from "@/components/animation/stagger-list";

const Conversation = () => {
  const { messages, sendMessage, status, stop, error } = useChat({
    chat: sharedChat,
    experimental_throttle: 50,
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSend = React.useCallback(
    (text: string) => {
      void sendMessage({ text });
    },
    [sendMessage],
  );

  return (
    <div className="border-border bg-background shadow-shadow flex h-full flex-col border-2">
      {/* Header */}
      <div className="border-border flex items-center gap-2.5 border-b-2 px-4 py-3">
        <div className="bg-main border-border flex size-8 shrink-0 items-center justify-center border-2">
          <BotMessageSquare className="text-main-foreground size-4" />
        </div>
        <div>
          <p className="text-foreground text-sm font-black tracking-tight">
            Aurafy Chat
          </p>
          <p className="text-muted-foreground text-[11px]">via Groq · Llama-4</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {messages.length === 0 ? (
            <ChatEmpty onSuggestion={handleSend} />
          ) : (
            <StaggerList className="flex flex-col gap-2.5" itemDistance={10} itemDirection="up" staggerDelay={0.03} animateExit={false}>
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}

              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="border-border bg-secondary-background text-muted-foreground flex items-center gap-2 border-2 px-3 py-2 text-xs">
                    <Loader2 className="size-3 animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}

              {error && (
                <div className="border-border bg-secondary-background text-muted-foreground border-2 px-3 py-2 text-center text-xs">
                  Something went wrong. Try again.
                </div>
              )}
              <div ref={scrollRef} />
            </StaggerList>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-border border-t-2 px-4 py-3">
        <ChatInput status={status} onSend={handleSend} onStop={stop} />
      </div>
    </div>
  );
};

export default Conversation;
