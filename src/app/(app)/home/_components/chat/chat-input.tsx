import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Square } from "lucide-react";

interface ChatInputProps {
  status: "ready" | "submitted" | "streaming" | "error";
  onSend: (text: string) => void;
  onStop: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ status, onSend, onStop }) => {
  const [input, setInput] = React.useState("");

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="How are you feeling today?"
        disabled={isLoading}
        className="text-foreground placeholder:text-muted-foreground flex-1"
      />

      {isLoading ? (
        <Button type="button" variant="neutral" size="icon" onClick={onStop} title="Stop">
          <Square className="size-3.5" />
        </Button>
      ) : (
        <Button type="submit" size="icon" disabled={!input.trim()} title="Send">
          <SendHorizonal className="size-3.5" />
        </Button>
      )}
    </form>
  );
};

export default ChatInput;
