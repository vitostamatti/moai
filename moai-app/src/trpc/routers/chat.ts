import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { createChat, updateChat, deleteChat } from "@/db/mutations";
import {
  listChatsForUser,
  getChatById,
  getMessagesByChatId,
  listChatsForUserAndModel,
} from "@/db/queries";
import { TRPCError } from "@trpc/server";

export const chatRouter = router({
  // Create a new chat
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        modelId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const chat = await createChat({
        title: input.title,
        userId: userId,
        modelId: input.modelId,
      });

      return chat;
    }),

  // Get a specific chat by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      const chat = await getChatById(input.id);

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Check if user has access to this chat
      if (chat.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this chat",
        });
      }
      return chat;
    }),

  // List chats for current user with metadata
  list: protectedProcedure
    .input(z.object({ modelId: z.string(), limit: z.number().min(1) }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      const chats = await listChatsForUserAndModel(userId, input.modelId);

      return chats
        .filter((chat) => chat.userId === userId)
        .slice(0, input.limit);
    }),

  // Update chat title or visibility
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const chat = await updateChat(input.id, userId, {
        title: input.title,
      });

      return chat;
    }),

  // Delete a chat
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      await deleteChat(input.id, userId);

      return { success: true };
    }),
});
