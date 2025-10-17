import { UIMessagePart } from "ai";
import { ChatMessage, ChatTools, CustomUIDataTypes } from "./types";
import * as s from "@/db/schema";
import { getModelWithComponents } from "@/db/queries";

export function convertToUIMessages(
  messages: s.MessageSelect[]
): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
  }));
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const modelWithComponentsToModel = (
  model: NonNullable<Awaited<ReturnType<typeof getModelWithComponents>>>
) => {
  return {
    sets: model.sets.map((s) => s.data),
    parameters: model.parameters.map((p) => p.data),
    variables: model.variables.map((v) => v.data),
    constraints: model.constraints.map((c) => c.data),
    objective:
      model.objectives.length > 0 ? model.objectives[0].data : undefined,
  };
};
