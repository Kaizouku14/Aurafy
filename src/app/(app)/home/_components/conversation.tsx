"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { api } from "@/trpc/react";

const Conversation = () => {
  const { mutateAsync: sendMessage, isPending } =
    api.chat.sendMessage.useMutation();

  const handleSendMessage = async () => {
    const reply = await sendMessage({ message: "I need to study right now" });

    console.log(reply);
  };

  return (
    <Card className="w-1/2">
      <CardHeader>Chat with Groq</CardHeader>
      <CardContent className="border-border h-80 border-y"></CardContent>
      <CardFooter>
        <Button onClick={handleSendMessage} disabled={isPending}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Conversation;
