import { z } from "zod";

export const paramDefinitionFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim(),
    description: z.string().optional(),
    indices: z.array(z.string()),
    valueType: z.enum(["scalar", "indexed"]),
    scalarValue: z.string().optional(),
    indexedValues: z
      .array(
        z.object({
          index: z.array(z.string()),
          value: z.string(),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.valueType === "scalar") {
        return data.scalarValue !== undefined && data.scalarValue.trim() !== "";
      }
      if (data.valueType === "indexed") {
        return (
          data.indexedValues !== undefined && data.indexedValues.length > 0
        );
      }
      return true;
    },
    {
      message: "Please provide a value for the parameter",
    }
  );

export type ParamDefinitionFormSchema = z.infer<
  typeof paramDefinitionFormSchema
>;
