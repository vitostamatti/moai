import { InferUITool, UIMessage } from "ai";
import { createSetDefinitionTool } from "./tools";

export type ChatTools = {
  createSetDefinition: InferUITool<typeof createSetDefinitionTool>;
};
export type MessageMetadata = { createdAt: string };
export type CustomUIDataTypes = { id: string };
export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;
