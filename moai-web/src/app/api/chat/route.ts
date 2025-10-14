import { getActiveOrganization, getSession } from "@/lib/auth";
import { systemPrompt } from "@/lib/chat/prompts";
import { ChatMessage } from "@/lib/chat/types";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { redirect } from "next/navigation";

import { getChatById, getMessagesByChatId } from "@/db/queries";
import { addMessagesToChat } from "@/db/mutations";
import { convertToUIMessages, generateUUID } from "@/lib/chat/utils";
import { createSetDefinitionTool } from "@/lib/chat/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { id, message }: { id: string; message: ChatMessage } =
    await req.json();

  const { user } = await getSession();

  const organization = await getActiveOrganization();
  if (!organization) {
    redirect("/organization");
  }
  const chat = await getChatById(id);

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }
  if (chat?.userId !== user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }
  const messagesFromDb = await getMessagesByChatId(id);
  const messages = [...convertToUIMessages(messagesFromDb), message];

  await addMessagesToChat({
    messages: [
      {
        chatId: id,
        id: message.id,
        role: "user",
        parts: message.parts,
        createdAt: new Date(),
      },
    ],
  });

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt(),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      createSetDefinition: createSetDefinitionTool,
    },
  });
  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    generateMessageId: generateUUID,
    onFinish: async ({ messages }) => {
      console.log({ onFinish: messages });
      await addMessagesToChat({
        messages: messages.map((message) => ({
          id: message.id,
          role: message.role,
          parts: message.parts,
          createdAt: new Date(),
          chatId: id,
        })),
      });
    },
  });
}
