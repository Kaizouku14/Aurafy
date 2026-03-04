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
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="How are you feeling today?"
        disabled={isLoading}
        className="bg-background text-foreground placeholder:text-muted-foreground"
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
    </form>
  );
};

export default ChatInput;
