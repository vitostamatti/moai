import { z } from "zod";

export const paramIndexedValueSchema = z.object({
  index: z.array(z.union([z.string(), z.number()])),
  value: z.number(),
});
export const paramValuesSchema = z.union([
  z.array(paramIndexedValueSchema),
  z.number(),
  z.string(),
]);
export const paramDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  indices: z.array(z.string()),
  values: paramValuesSchema,
});

export type IndexedParamValue = z.infer<typeof paramIndexedValueSchema>;
export type ParamDefinition = z.infer<typeof paramDefinitionSchema>;
export type ParamValues = z.infer<typeof paramValuesSchema>;
