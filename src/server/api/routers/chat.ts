import { createTRPCRouter, protectedProcedure } from "../trpc";
import { chatFormSchema } from "@/types/schema";
import { processMessage } from "@/lib/api/chat/mutation";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(chatFormSchema)
    .mutation(async ({ input }) => {
      return await processMessage(input);
    }),
});
