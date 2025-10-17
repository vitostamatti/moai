import { tool } from "ai";
import z from "zod";
import {
  constraintSchema,
  objectiveSchema,
  parameterSchema,
  setSchema,
  variableSchema,
} from "../model/schemas";
import { getModelById, getModelWithComponents } from "@/db/queries";
import {
  createConstraint,
  createObjective,
  createParameter,
  createSet,
  createVariable,
  deleteConstraint,
  deleteObjective,
  deleteParameter,
  deleteSet,
  deleteVariable,
  updateConstraint,
  updateObjective,
  updateParameter,
  updateSet,
  updateVariable,
} from "@/db";
import { generateUUID, modelWithComponentsToModel } from "./utils";
import { Constraint, Objective } from "../model/types";
import { validateSet } from "../model/validators";

const createSetSchema = z.object({
  name: z
    .string()
    .min(1, "The display name of the set. Also used as the unique identifier."),
  description: z.string().optional(),
  data: setSchema,
});

export const createSetTool = (modelId: string) =>
  tool({
    description:
      "Create a new set definition for the optimization model. Sets define the indices over which variables, parameters, and constraints are defined (e.g., set of plants, markets, time periods, products).",
    inputSchema: createSetSchema,
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if set exists (based on name)
      const existingSet = model.sets.find(
        (set) => set.name === inputs.data.name
      );
      if (existingSet) {
        // if exists, return error
        throw new Error(`Set '${inputs.data.name}' already exists`);
      }
      // validation

      const errors = validateSet(
        modelWithComponentsToModel(model),
        inputs.data
      );
      if (errors.length > 0) {
        throw new Error(
          `Set validation failed: ${errors
            .map((e) => `${e.field} - ${e.message}`)
            .join(", ")}`
        );
      }
      try {
        await createSet({
          id: generateUUID(),
          modelId: model.id,
          name: inputs.name,
          description: inputs.description || null,
          data: inputs.data,
        });
      } catch (error) {
        throw new Error(`Failed to store set information. Try again.`);
      }
      return {
        status: "success",
        message: `Set definition '${inputs.name}' created successfully.`,
      };
    },
  });

const updateSetSchema = z.object({
  name: z
    .string()
    .min(1, "The display name of the set. Also used as the unique identifier."),
  description: z.string().optional(),
  data: setSchema,
});
export const updateSetTool = (modelId: string) =>
  tool({
    description:
      "Update an existing set definition for the optimization model.",
    inputSchema: updateSetSchema,
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if set exists (based on name)
      const existingSet = model.sets.find((set) => set.name === inputs.name);
      if (!existingSet) {
        // if not exists, return error
        throw new Error(`Set '${inputs.name}' does not exist`);
      }
      // if exists, update set in model storage
      await updateSet(existingSet.id, {
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data,
      });

      // return success message
      return {
        status: "success",
        message: `Set definition '${inputs.name}' updated successfully`,
      };
    },
  });

export const deleteSetTool = (modelId: string) =>
  tool({
    description:
      "Delete an existing set definition from the optimization model.",
    inputSchema: z.object({
      name: z.string().min(1, "Set name is required"),
    }),
    execute: async (inputs) => {
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      const existingSet = model.sets.find((set) => set.name === inputs.name);
      if (!existingSet) {
        throw new Error(`Set '${inputs.name}' does not exist`);
      }
      // delete set
      await deleteSet(existingSet.id);
      return {
        status: "success",
        message: `Set definition '${existingSet.name}' deleted successfully`,
      };
    },
  });

// Variables Tools
const createVariableSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the variable. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: variableSchema,
});

export const createVariableTool = (modelId: string) =>
  tool({
    description:
      "Create a new decision variable for the optimization model. Variables represent the unknowns that the optimizer will determine values for (e.g., production quantities, flow amounts, binary decisions).",
    inputSchema: createVariableSchema,
    execute: async (inputs) => {
      // get model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if variable exists (based on name)
      const existingVar = model.variables.find(
        (variable) => variable.name === inputs.data.name
      );
      if (existingVar) {
        // if exists, return error
        throw new Error(`Variable '${inputs.data.name}' already exists`);
      }
      // create variable in model storage
      await createVariable({
        id: generateUUID(),
        modelId: model.id,
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data,
      });

      return {
        status: "success",
        message: `Variable definition '${inputs.name}' created successfully with domain '${inputs.data.domain}'`,
      };
    },
  });

const updateVariableSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the variable. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: variableSchema,
});
export const updateVariableTool = (modelId: string) =>
  tool({
    description:
      "Update an existing decision variable for the optimization model.",
    inputSchema: updateVariableSchema,
    execute: async (inputs) => {
      // get model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if variable exists (based on name)
      const existingVar = model.variables.find(
        (variable) => variable.name === inputs.data.name
      );
      if (!existingVar) {
        // if not exists, return error
        throw new Error(`Variable '${inputs.data.name}' does not exist`);
      }
      // update variable in model storage
      await updateVariable(existingVar.id, {
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data,
      });
      return {
        status: "success",
        message: `Variable definition '${inputs.name}' updated successfully`,
      };
    },
  });

export const deleteVariableTool = (modelId: string) =>
  tool({
    description:
      "Delete an existing decision variable from the optimization model.",
    inputSchema: z.object({
      name: z.string().min(1, "Variable name used as identifier."),
    }),
    execute: async (inputs) => {
      // get model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if variable exists (based on name)
      const existingVar = model.variables.find(
        (variable) => variable.name === inputs.name
      );
      if (!existingVar) {
        // if not exists, return error
        throw new Error(`Variable '${inputs.name}' does not exist`);
      }
      // delete variable from model storage
      await deleteVariable(existingVar.id);

      return {
        status: "success",
        message: `Variable definition '${inputs.name}' deleted successfully`,
      };
    },
  });

// Parameters Tools
const createParameterSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the parameter. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: parameterSchema,
});

export const createParameterTool = (modelId: string) =>
  tool({
    description:
      "Create a new parameter definition for the optimization model. Parameters represent known data/constants in the model (e.g., costs, capacities, demands, distances).",
    inputSchema: createParameterSchema,
    execute: async (inputs) => {
      // get model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if parameter exists (based on name)
      const existingParam = model.parameters.find(
        (param) => param.name === inputs.data.name
      );
      if (existingParam) {
        // if exists, return error
        throw new Error(`Parameter '${inputs.data.name}' already exists`);
      }
      // create parameter in model storage
      await createParameter({
        id: generateUUID(),
        modelId: model.id,
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data,
      });
      return {
        status: "success",
        message: `Parameter definition '${inputs.name}' created successfully`,
      };
    },
  });

const updateParameterSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the parameter. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: parameterSchema,
});
export const updateParameterTool = (modelId: string) =>
  tool({
    description:
      "Update an existing parameter definition for the optimization model.",
    inputSchema: updateParameterSchema,
    execute: async (inputs) => {
      // get model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if parameter exists (based on name)
      const existingParam = model.parameters.find(
        (param) => param.name === inputs.data.name
      );
      if (!existingParam) {
        // if not exists, return error
        throw new Error(`Parameter '${inputs.data.name}' does not exist`);
      }
      // update parameter in model storage
      await updateParameter(existingParam.id, {
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data,
      });

      return {
        status: "success",
        message: `Parameter definition '${inputs.name}' updated successfully`,
      };
    },
  });

export const deleteParameterTool = (modelId: string) =>
  tool({
    description:
      "Delete an existing parameter definition from the optimization model.",
    inputSchema: z.object({
      name: z.string().min(1, "Parameter name used as identifier."),
    }),
    execute: async (inputs) => {
      // get model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if parameter exists (based on name)
      const existingParam = model.parameters.find(
        (param) => param.name === inputs.name
      );
      if (!existingParam) {
        // if not exists, return error
        throw new Error(`Parameter '${inputs.name}' does not exist`);
      }
      await deleteParameter(existingParam.id);

      return {
        status: "success",
        message: `Parameter definition '${inputs.name}' deleted successfully`,
      };
    },
  });

const createConstraintSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the constraint. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: constraintSchema,
});

export const createConstraintTool = (modelId: string) =>
  tool({
    description:
      "Create a new constraint for the optimization model. Constraints define the mathematical relationships and limitations that must be satisfied (e.g., capacity limits, demand requirements, flow balance equations).",
    inputSchema: createConstraintSchema,
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if constraint exists (based on name)
      const existingConstraint = model.constraints.find(
        (constraint) => constraint.name === inputs.data.name
      );
      if (existingConstraint) {
        // if exists, return error
        throw new Error(`Constraint '${inputs.data.name}' already exists`);
      }
      // if not, add constraint to model storage
      await createConstraint({
        id: generateUUID(),
        modelId: model.id,
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data as Constraint, // TODO: validate this
      });

      return {
        status: "success",
        message: `Constraint definition '${inputs.name}' created successfully`,
      };
    },
  });

const updateConstraintSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the constraint. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: constraintSchema,
});
export const updateConstraintTool = (modelId: string) =>
  tool({
    description: "Update an existing constraint for the optimization model.",
    inputSchema: updateConstraintSchema,
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if constraint exists (based on name)
      const existingConstraint = model.constraints.find(
        (constraint) => constraint.name === inputs.data.name
      );
      if (!existingConstraint) {
        // if not exists, return error
        throw new Error(`Constraint '${inputs.data.name}' does not exist`);
      }
      // if exists, update constraint in model storage
      await updateConstraint(existingConstraint.id, {
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data as Constraint, // TODO: validate this
      });
      return {
        status: "success",
        message: `Constraint definition '${inputs.name}' updated successfully`,
      };
    },
  });

export const deleteConstraintTool = (modelId: string) =>
  tool({
    description: "Delete an existing constraint from the optimization model.",
    inputSchema: z.object({
      name: z.string().min(1, "Constraint name used as identifier."),
    }),
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if constraint exists (based on name)
      const existingConstraint = model.constraints.find(
        (constraint) => constraint.name === inputs.name
      );
      if (!existingConstraint) {
        // if not exists, return error
        throw new Error(`Constraint '${inputs.name}' does not exist`);
      }
      // delete constraint from model storage
      await deleteConstraint(existingConstraint.id);

      return {
        status: "success",
        message: `Constraint definition '${inputs.name}' deleted successfully`,
      };
    },
  });

const createObjectiveSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the objective. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: objectiveSchema,
});

export const createObjectiveTool = (modelId: string) =>
  tool({
    description:
      "Create a new objective function for the optimization model. The objective defines what the model should optimize (minimize costs, maximize profits, minimize time, etc.).",
    inputSchema: createObjectiveSchema,
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if objective exists (based on name)
      const existingObjective = model.objectives.find(
        (objective) => objective.name === inputs.data.name
      );
      if (existingObjective) {
        // if exists, return error
        throw new Error(`Objective '${inputs.data.name}' already exists`);
      }
      // if not, add objective to model storage
      await createObjective({
        id: generateUUID(),
        modelId: model.id,
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data as Objective,
      });
      return {
        status: "success",
        message: `Objective definition '${inputs.name}' created successfully`,
      };
    },
  });

const updateObjectiveSchema = z.object({
  name: z
    .string()
    .min(
      1,
      "The display name of the objective. Also used as the unique identifier."
    ),
  description: z.string().optional(),
  data: objectiveSchema,
});
export const updateObjectiveTool = (modelId: string) =>
  tool({
    description:
      "Update an existing objective function for the optimization model.",
    inputSchema: updateObjectiveSchema,
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if objective exists (based on name)
      const existingObjective = model.objectives.find(
        (objective) => objective.name === inputs.data.name
      );
      if (!existingObjective) {
        // if not exists, return error
        throw new Error(`Objective '${inputs.data.name}' does not exist`);
      }
      // if exists, update objective in model storage
      await updateObjective(existingObjective.id, {
        name: inputs.name,
        description: inputs.description || null,
        data: inputs.data as Objective,
      });
      return {
        status: "success",
        message: `Objective definition '${inputs.name}' updated successfully`,
      };
    },
  });

export const deleteObjectiveTool = (modelId: string) =>
  tool({
    description:
      "Delete an existing objective function from the optimization model.",
    inputSchema: z.object({
      name: z.string().min(1, "Objective name used as identifier."),
    }),
    execute: async (inputs) => {
      // get current model
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      // check if objective exists (based on name)
      const existingObjective = model.objectives.find(
        (objective) => objective.name === inputs.name
      );
      if (!existingObjective) {
        // if not exists, return error
        throw new Error(`Objective '${inputs.name}' does not exist`);
      }
      await deleteObjective(existingObjective.id);
      return {
        status: "success",
        message: `Objective definition '${inputs.name}' deleted successfully`,
      };
    },
  });

export const listModelComponentTool = (modelId: string) =>
  tool({
    description:
      "List components for the optimization model of a given type (sets, variables, parameters, constraints, objectives).",
    inputSchema: z.object({
      type: z.enum(["set", "variable", "parameter", "constraint", "objective"]),
    }),
    execute: async (inputs) => {
      const model = await getModelWithComponents(modelId);
      if (!model) {
        throw new Error("Model not found");
      }
      const { type } = inputs;
      switch (type) {
        case "set":
          return {
            status: "success",
            message: `Listed ${model.sets.length} set components successfully`,
            data: model.sets.map((s) => s.name),
          };
        case "variable":
          return {
            status: "success",
            message: `Listed ${model.variables.length} variable components successfully`,
            data: model.variables.map((v) => v.name),
          };
        case "parameter":
          return {
            status: "success",
            message: `Listed ${model.parameters.length} parameter components successfully`,
            data: model.parameters.map((p) => p.name),
          };
        case "constraint":
          return {
            status: "success",
            message: `Listed ${model.constraints.length} constraint components successfully`,
            data: model.constraints.map((c) => c.name),
          };
        case "objective":
          return {
            status: "success",
            message: `Listed ${model.objectives.length} objective components successfully`,
            data: model.objectives.map((o) => o.name),
          };
      }
    },
  });

export const tools = (modelId: string) => ({
  // Set management
  createSet: createSetTool(modelId),
  updateSet: updateSetTool(modelId),
  deleteSet: deleteSetTool(modelId),
  // Variable management
  createVariable: createVariableTool(modelId),
  updateVariable: updateVariableTool(modelId),
  deleteVariable: deleteVariableTool(modelId),
  // Parameter management
  createParameter: createParameterTool(modelId),
  updateParameter: updateParameterTool(modelId),
  deleteParameter: deleteParameterTool(modelId),
  // Constraint management
  createConstraint: createConstraintTool(modelId),
  updateConstraint: updateConstraintTool(modelId),
  deleteConstraint: deleteConstraintTool(modelId),
  // Objective management
  createObjective: createObjectiveTool(modelId),
  updateObjective: updateObjectiveTool(modelId),
  deleteObjective: deleteObjectiveTool(modelId),
  // Tools to retrieve model info
  listComponents: listModelComponentTool(modelId),
});
