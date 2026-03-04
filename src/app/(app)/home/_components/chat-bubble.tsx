import React from "react";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { ROLES_LABELS } from "@/constants/role";

interface ChatBubbleProps {
  message: UIMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = React.memo(({ message }) => {
  const isUser = message.role === ROLES_LABELS.USER;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-base border-border max-w-[80%] border-2 px-3 py-2 text-sm",
          isUser
            ? "bg-main text-main-foreground"
            : "bg-secondary-background text-foreground",
        )}
      >
        {message.parts.map((part, i) =>
          part.type === "text" ? (
            <span key={i} className="whitespace-pre-wrap">
              {part.text}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
});

ChatBubble.displayName = "ChatBubble";

export default ChatBubble;
