import { createTRPCRouter, protectedProcedure } from "../trpc";
import { chatFormSchema } from "@/types/schema";
import { processMessage } from "@/lib/api/chat/mutation";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(chatFormSchema)
    .mutation(async ({ input }) => {
      const reply = await processMessage(input);
      console.log(reply);
      return reply;
    }),
});
