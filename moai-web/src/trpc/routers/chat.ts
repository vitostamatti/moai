import { protectedProcedure, router } from "../init";
import { z } from "zod";
import { createChat, updateChat, deleteChat } from "@/db/mutations";
import {
  listChatsForUser,
  listChatsForOrganization,
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
      const { session, organizationId } = ctx;

      const chat = await createChat({
        title: input.title,
        userId: session.user.id,
        organizationId,
        visibility: input.visibility,
      });

      return chat;
    }),

  // Get a specific chat by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session } = ctx;

      const chat = await getChatById(input.id);

      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found",
        });
      }

      // Check if user has access to this chat
      if (
        chat.userId !== session.user.id &&
        chat.organizationId !== ctx.organizationId
      ) {
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
      const { session, organizationId } = ctx;

      // Get user's private chats
      const userChats = await listChatsForUser(session.user.id);

      // Get organization chats if user is in an organization
      const orgChats = organizationId
        ? await listChatsForOrganization(organizationId)
        : [];

      // Get last message for each chat for preview
      const allChats = [...userChats, ...orgChats];
      const chatsWithPreview = await Promise.all(
        allChats.map(async (chat) => {
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
        .filter((chat) => chat.userId === session.user.id)
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
      const { session } = ctx;

      const chat = await updateChat(input.id, session.user.id, {
        title: input.title,
        visibility: input.visibility,
      });

      return chat;
    }),

  // Delete a chat
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      await deleteChat(input.id, session.user.id);

      return { success: true };
    }),
});
