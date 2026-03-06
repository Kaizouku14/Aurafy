import React from "react";
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
    <div className="flex h-full flex-col justify-center px-4 py-12">
      <div className="mb-6">
        <h2 className="text-foreground text-base font-black tracking-tight">
          Hey, I&apos;m Aurafy
        </h2>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Tell me how you feel and I&apos;ll find the perfect music for you.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground mb-2 text-[11px] font-semibold uppercase tracking-widest">
          Try asking
        </p>
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onSuggestion(s.label)}
            className="border-border bg-secondary-background text-foreground hover:bg-main hover:text-main-foreground flex w-full cursor-pointer items-center gap-2.5 border-2 px-3 py-2 text-left text-xs font-medium transition-colors"
          >
            <s.icon className="text-muted-foreground size-3.5 shrink-0" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
});

ChatEmpty.displayName = "ChatEmpty";

export default ChatEmpty;
