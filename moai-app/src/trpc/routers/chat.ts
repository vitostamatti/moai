import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { createChat, updateChat, deleteChat } from "@/db/mutations";
import {
  listChatsForUser,
  getChatById,
  getMessagesByChatId,
} from "@/db/queries";
import { TRPCError } from "@trpc/server";

export const chatRouter = router({
  // Create a new chat
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        visibility: z.enum(["user", "organization"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const chat = await createChat({
        title: input.title,
        userId: userId,
        visibility: input.visibility,
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
    .input(z.object({ limit: z.number().min(1) }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;

      // Get user's private chats
      const chats = await listChatsForUser(userId);

      // Get last message for each chat for preview

      const chatsWithPreview = await Promise.all(
        chats.map(async (chat) => {
          const messages = await getMessagesByChatId(chat.id);
          const lastMessage = messages[messages.length - 1];

          return {
            ...chat,
            lastMessage: lastMessage
              ? {
                  content:
                    (lastMessage.parts as { text?: string }[])?.[0]?.text ||
                    "No content",
                  createdAt: lastMessage.createdAt,
                }
              : null,
            messageCount: messages.length,
          };
        })
      );

      return chatsWithPreview
        .filter((chat) => chat.userId === userId)
        .slice(0, input.limit);
    }),

  // Update chat title or visibility
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        visibility: z.enum(["user", "organization"]).optional(),
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
