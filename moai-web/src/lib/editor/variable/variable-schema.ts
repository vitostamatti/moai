import { z } from "zod";

export const variableDomainSchema = z.enum([
  "Binary",
  "NonNegativeIntegers",
  "NonNegativeReals",
  "Reals",
  "Integers",
]);

export const variableDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  domain: variableDomainSchema,
  lb: z.number().optional(),
  ub: z.number().optional(),
  indices: z.array(z.string()).optional(),
});

export type VariableDomain = z.infer<typeof variableDomainSchema>;
export type VariableDefinition = z.infer<typeof variableDefinitionSchema>;
