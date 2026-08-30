import React from "react";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { ROLES_LABELS } from "@/constants/role";
import type { Track } from "@/types/schema/chat";
import ChatTrackList from "./chat-track-list";

interface ChatBubbleProps {
  message: UIMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = React.memo(({ message }) => {
  const isUser = message.role === ROLES_LABELS.USER;

  const tracksPart = message.parts.find(
    (part) => part.type === "data-tracks",
  ) as { type: "data-tracks"; data: Track[] } | undefined;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] border-2 px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-main text-main-foreground border-border shadow-shadow"
            : "bg-secondary-background border-border text-foreground",
        )}
      >
        {message.parts.map((part, i) =>
          part.type === "text" ? (
            <span key={i} className="whitespace-pre-wrap">
              {part.text}
            </span>
          ) : null,
        )}
        {tracksPart && <ChatTrackList tracks={tracksPart.data} />}
      </div>
    </div>
  );
});

ChatBubble.displayName = "ChatBubble";

export default ChatBubble;
