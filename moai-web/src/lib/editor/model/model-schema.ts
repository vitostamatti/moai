import { z } from "zod";
import { setDefinitionSchema } from "../set/set-schema";
import { paramDefinitionSchema } from "../param/param-schema";
import { variableDefinitionSchema } from "../variable/variable-schema";
import { constraintDefinitionSchema } from "../constraint/constraint-schema";
import { objectiveDefinitionSchema } from "../objective/objective-schema";

export const modelMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const milpModelSchema = z.object({
  metadata: modelMetadataSchema,
  sets: z.array(setDefinitionSchema),
  parameters: z.array(paramDefinitionSchema),
  variables: z.array(variableDefinitionSchema),
  constraints: z.array(constraintDefinitionSchema),
  objective: objectiveDefinitionSchema,
});

export type ModelMetadata = z.infer<typeof modelMetadataSchema>;
export type MILPModel = z.infer<typeof milpModelSchema>;
