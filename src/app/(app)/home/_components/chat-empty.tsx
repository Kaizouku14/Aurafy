import React from "react";
import { Button } from "@/components/ui/button";
import { Music, Smile, MessageCircle } from "lucide-react";

const suggestions = [
  { icon: Smile, label: "I'm feeling happy today" },
  { icon: Music, label: "Play something chill" },
  { icon: MessageCircle, label: "What can you do?" },
];

interface ChatEmptyProps {
  onSuggestion: (text: string) => void;
}

const ChatEmpty: React.FC<ChatEmptyProps> = React.memo(({ onSuggestion }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h2 className="font-heading text-lg">Hey, I'm Aurafy</h2>
        <p className="text-foreground/60 text-sm">
          Tell me how you feel and I'll find the perfect music for you.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <Button
            key={s.label}
            type="button"
            variant="neutral"
            onClick={() => onSuggestion(s.label)}
            className="rounded-base flex cursor-pointer items-center gap-2 border-2 px-3 py-1.5 text-sm transition-colors"
          >
            <s.icon className="size-4" />
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

ChatEmpty.displayName = "ChatEmpty";

export default ChatEmpty;
