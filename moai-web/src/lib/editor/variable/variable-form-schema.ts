import { z } from "zod";
import { variableDomainSchema } from "@/lib/editor/variable/variable-schema";

export const variableFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  domain: variableDomainSchema,
  lb: z.string().optional(),
  ub: z.string().optional(),
  indices: z.array(z.string()).optional(),
});

export type VariableFormData = z.infer<typeof variableFormSchema>;
