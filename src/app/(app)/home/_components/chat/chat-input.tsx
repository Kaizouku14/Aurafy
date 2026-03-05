import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  status: "ready" | "submitted" | "streaming" | "error";
  onSend: (text: string) => void;
  onStop: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ status, onSend, onStop }) => {
  const [input, setInput] = React.useState("");

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="How are you feeling today?"
          disabled={isLoading}
          className="text-foreground placeholder:text-muted-foreground"
        />

        {isLoading ? (
          <Button type="button" variant="neutral" onClick={onStop}>
            Stop
          </Button>
        ) : (
          <Button type="submit" disabled={!input.trim()}>
            Send
          </Button>
        )}
      </div>

      <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-center text-xs">
        Press{" "}
        <kbd className="bg-main text-foreground rounded px-1 py-0.5 font-mono text-[10px]">
          Enter
        </kbd>{" "}
        to send · 30-message context limit
      </p>
    </form>
  );
};

export default ChatInput;
