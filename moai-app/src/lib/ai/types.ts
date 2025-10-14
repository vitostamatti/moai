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
  createSetDefinition: InferUITool<ReturnType<typeof createSetTool>>;
  updateSetDefinition: InferUITool<ReturnType<typeof updateSetTool>>;
  deleteSetDefinition: InferUITool<ReturnType<typeof deleteSetTool>>;
  //
  updateVariableDefinition: InferUITool<ReturnType<typeof updateVariableTool>>;
  deleteVariableDefinition: InferUITool<ReturnType<typeof deleteVariableTool>>;
  createVariableDefinition: InferUITool<ReturnType<typeof createVariableTool>>;
  //
  createParameterDefinition: InferUITool<
    ReturnType<typeof createParameterTool>
  >;
  updateParameterDefinition: InferUITool<
    ReturnType<typeof updateParameterTool>
  >;
  deleteParameterDefinition: InferUITool<
    ReturnType<typeof deleteParameterTool>
  >;
  //
  createConstraintDefinition: InferUITool<
    ReturnType<typeof createConstraintTool>
  >;
  updateConstraintDefinition: InferUITool<
    ReturnType<typeof updateConstraintTool>
  >;
  deleteConstraintDefinition: InferUITool<
    ReturnType<typeof deleteConstraintTool>
  >;
  //
  createObjectiveDefinition: InferUITool<
    ReturnType<typeof createObjectiveTool>
  >;
  updateObjectiveDefinition: InferUITool<
    ReturnType<typeof updateObjectiveTool>
  >;
  deleteObjectiveDefinition: InferUITool<
    ReturnType<typeof deleteObjectiveTool>
  >;
};

export type MessageMetadata = { createdAt: string };
export type CustomUIDataTypes = { id: string };
export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;
