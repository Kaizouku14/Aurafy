import { createTRPCRouter, protectedProcedure } from "../trpc";
import { chatFormSchema } from "@/types/schema";
import { processMessage } from "@/lib/api/chat/mutation";

import { saveChatExchangeSchema, userIdSchema } from "@/types/schema/chat";
import {
  clearChatHistory,
  loadChatHistory,
  saveChatExchange,
} from "@/lib/api/chat/memory";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(chatFormSchema)
    .mutation(async ({ input }) => {
      return await processMessage(input);
    }),
  loadChatHistory: protectedProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      return await loadChatHistory(input);
    }),
  saveChatExchange: protectedProcedure
    .input(saveChatExchangeSchema)
    .mutation(async ({ input }) => {
      await saveChatExchange(input);
    }),
  clearChatHistory: protectedProcedure
    .input(userIdSchema)
    .mutation(async ({ input }) => {
      await clearChatHistory(input);
    }),
});
