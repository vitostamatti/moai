import { openai } from "@ai-sdk/openai";
import { getActiveOrganization, getSession } from "@/auth/server";
import { systemPrompt } from "@/lib/ai/prompts";
import { ChatMessage } from "@/lib/ai/types";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { redirect } from "next/navigation";

import {
  getChatById,
  getMessagesByChatId,
  getModelWithComponents,
} from "@/db/queries";
import { addMessagesToChat } from "@/db/mutations";
import { convertToUIMessages, generateUUID } from "@/lib/ai/utils";
import { tools } from "@/lib/ai/tools";
import { modelToString } from "@/lib/model/utils";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    id,
    modelId,
    message,
  }: { id: string; modelId: string; message: ChatMessage } = await req.json();

  const { user } = await getSession();
  if (!user) {
    redirect("/");
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
  // get current model
  const model = await getModelWithComponents(modelId);
  if (!model) {
    return Response.json({ error: "Model not found" }, { status: 404 });
  }
  const modelString = modelToString({
    sets: model.sets.map((set) => set.data),
    parameters: model.parameters.map((param) => param.data),
    variables: model.variables.map((variable) => variable.data),
    constraints: model.constraints.map((constraint) => constraint.data),
    objective:
      model.objectives.length > 0
        ? model.objectives.map((objective) => objective.data)[0]
        : undefined,
  });

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt({ modelString }),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: tools(modelId),
  });
  return result.toUIMessageStreamResponse({
    sendReasoning: true,
    generateMessageId: generateUUID,
    onFinish: async ({ messages }) => {
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
