import { z } from "zod";

export const setDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  elements: z.union([z.array(z.string()), z.array(z.number())]),
  isDraft: z.boolean(),
});

export type SetDefinition = z.infer<typeof setDefinitionSchema>;

export const createSetDefinitionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  elements: z.union([z.array(z.string()), z.array(z.number())]).optional(),
});

export type CreateSetDefinitionSchema = z.infer<
  typeof createSetDefinitionSchema
>;
