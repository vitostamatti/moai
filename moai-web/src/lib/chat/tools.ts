import { tool } from "ai";
import { createSetDefinitionSchema } from "../editor/set/set-schema";

export const createSetDefinitionTool = tool({
  description: "Create a new set definition",
  inputSchema: createSetDefinitionSchema,
  // outputSchema: setDefinitionSchema,
  execute: async (inputs) => {
    const setDefinitionData = createSetDefinitionSchema.parse(inputs);
    return {
      status: "success",
      message: `Set definition created successfully`,
      data: setDefinitionData,
    };
  },
});
