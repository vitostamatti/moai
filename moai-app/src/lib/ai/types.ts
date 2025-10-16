import { InferUITool, UIMessage } from "ai";
import {
  createSetTool,
  updateSetTool,
  deleteSetTool,
  createVariableTool,
  updateVariableTool,
  deleteVariableTool,
  createParameterTool,
  updateParameterTool,
  deleteParameterTool,
  createConstraintTool,
  updateConstraintTool,
  deleteConstraintTool,
  createObjectiveTool,
  updateObjectiveTool,
  deleteObjectiveTool,
} from "./tools";

export type ChatTools = {
  createSet: InferUITool<ReturnType<typeof createSetTool>>;
  updateSet: InferUITool<ReturnType<typeof updateSetTool>>;
  deleteSet: InferUITool<ReturnType<typeof deleteSetTool>>;
  updateVariable: InferUITool<ReturnType<typeof updateVariableTool>>;
  deleteVariable: InferUITool<ReturnType<typeof deleteVariableTool>>;
  createVariable: InferUITool<ReturnType<typeof createVariableTool>>;
  createParameter: InferUITool<ReturnType<typeof createParameterTool>>;
  updateParameter: InferUITool<ReturnType<typeof updateParameterTool>>;
  deleteParameter: InferUITool<ReturnType<typeof deleteParameterTool>>;
  createConstraint: InferUITool<ReturnType<typeof createConstraintTool>>;
  updateConstraint: InferUITool<ReturnType<typeof updateConstraintTool>>;
  deleteConstraint: InferUITool<ReturnType<typeof deleteConstraintTool>>;
  createObjective: InferUITool<ReturnType<typeof createObjectiveTool>>;
  updateObjective: InferUITool<ReturnType<typeof updateObjectiveTool>>;
  deleteObjective: InferUITool<ReturnType<typeof deleteObjectiveTool>>;
};

export type MessageMetadata = { createdAt: string };
export type CustomUIDataTypes = { id: string };
export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;
